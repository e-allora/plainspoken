import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ImproveError,
  MAX_PROMPT_LENGTH,
  buildSystemPrompt,
  improvePrompt,
  validateIntent,
  validatePrompt,
} from "./improve";

describe("validatePrompt", () => {
  it("returns the trimmed prompt", () => {
    expect(validatePrompt("  write me an email  ")).toBe("write me an email");
  });

  it("rejects non-strings", () => {
    for (const bad of [undefined, null, 42, {}, [], true]) {
      expect(() => validatePrompt(bad)).toThrow(ImproveError);
    }
  });

  it("rejects empty and whitespace-only input", () => {
    expect(() => validatePrompt("")).toThrow(ImproveError);
    expect(() => validatePrompt("     ")).toThrow(ImproveError);
  });

  it("rejects input over the length cap, measured after trimming", () => {
    const tooLong = "a".repeat(MAX_PROMPT_LENGTH + 1);
    expect(() => validatePrompt(tooLong)).toThrow(ImproveError);

    const atCapWithSpaces = `  ${"a".repeat(MAX_PROMPT_LENGTH)}  `;
    expect(validatePrompt(atCapWithSpaces)).toHaveLength(MAX_PROMPT_LENGTH);
  });

  it("carries a 400 status for bad input", () => {
    try {
      validatePrompt("");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ImproveError);
      expect((error as ImproveError).status).toBe(400);
    }
  });
});

describe("validateIntent", () => {
  it("accepts known intents", () => {
    expect(validateIntent("code")).toBe("code");
    expect(validateIntent("write")).toBe("write");
  });

  it("treats absent and auto as undefined so detection runs", () => {
    expect(validateIntent(undefined)).toBeUndefined();
    expect(validateIntent(null)).toBeUndefined();
    expect(validateIntent("auto")).toBeUndefined();
    expect(validateIntent("")).toBeUndefined();
  });

  it("rejects unknown values", () => {
    expect(() => validateIntent("hack")).toThrow(ImproveError);
    expect(() => validateIntent(123)).toThrow(ImproveError);
  });
});

describe("improvePrompt request body", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  /** Stub fetch with a valid model reply and return the parsed request body. */
  async function captureBody(prompt: string, intent?: Parameters<typeof improvePrompt>[1]) {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubEnv("OPENROUTER_MODEL", "");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  improvedPrompt: "A clearer prompt.",
                  improvements: [{ label: "Added context", why: "So it knows more." }],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await improvePrompt(prompt, intent);
    return JSON.parse(fetchMock.mock.calls[0][1].body as string);
  }

  it("asks OpenRouter for zero data retention on every request", async () => {
    const body = await captureBody("help me write to my landlord");
    expect(body.provider).toEqual({ zdr: true, data_collection: "deny" });
  });

  it("uses the single rewrite model even for prompts detected as code", async () => {
    const body = await captureBody("there is an error on my mortgage statement");
    expect(body.model).toBe("anthropic/claude-haiku-4.5");
  });

  it("adds the category hint only when the user picked one", async () => {
    const picked = await captureBody("a cat in a hat", "image");
    expect(picked.messages[0].content).toContain("image generator");

    const auto = await captureBody("a cat in a hat");
    expect(auto.messages[0].content).not.toContain("The user said this request is about");
  });
});

describe("buildSystemPrompt", () => {
  it("adds no hint for 'something else'", () => {
    expect(buildSystemPrompt("general")).toBe(buildSystemPrompt());
  });
});

/**
 * /about promises this site doesn't store people's words, and Vercel keeps
 * runtime logs. So nothing a user typed may reach console output, even when
 * OpenRouter echoes it back inside an error (moderation rejections include a
 * fragment of the flagged input).
 */
describe("improvePrompt logging", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const WORDS = "my SSN is 123-45-6789, and my landlord Dana Whitfield will not fix the heat";

  function failWith(status: number, body: string) {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body, { status })));
    return vi.spyOn(console, "error").mockImplementation(() => {});
  }

  const logged = (spy: ReturnType<typeof failWith>) => spy.mock.calls.flat().map(String).join(" ");

  it("never logs the user's words when the upstream error echoes them", async () => {
    const spy = failWith(
      403,
      JSON.stringify({
        error: {
          code: 403,
          message: `Input was flagged: ${WORDS}`,
          metadata: { reasons: ["harassment"], flagged_input: WORDS.slice(0, 100) },
        },
      }),
    );

    await expect(improvePrompt(WORDS)).rejects.toBeInstanceOf(ImproveError);

    const out = logged(spy);
    expect(out).toContain("status=403");
    expect(out).toContain("code=403");
    for (const fragment of ["123-45-6789", "Dana", "Whitfield", "landlord", "flagged_input"]) {
      expect(out).not.toContain(fragment);
    }
  });

  it("logs only the status when the error body isn't JSON", async () => {
    const spy = failWith(500, `<html>upstream said: ${WORDS}</html>`);

    await expect(improvePrompt(WORDS)).rejects.toBeInstanceOf(ImproveError);

    const out = logged(spy);
    expect(out).toContain("status=500");
    expect(out).not.toContain("Dana");
    expect(out).not.toContain("upstream said");
  });

  it("drops an error code that isn't a short identifier", async () => {
    const spy = failWith(400, JSON.stringify({ error: { code: `bad ${WORDS}` } }));

    await expect(improvePrompt(WORDS)).rejects.toBeInstanceOf(ImproveError);

    expect(logged(spy)).toContain("status=400");
    expect(logged(spy)).not.toContain("Dana");
  });

  it("still tells the user something plain and safe", async () => {
    failWith(429, JSON.stringify({ error: { code: 429, message: WORDS } }));

    await expect(improvePrompt(WORDS)).rejects.toMatchObject({
      status: 429,
      message: "The AI service is busy right now. Please try again shortly.",
    });
  });
});
