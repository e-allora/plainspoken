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
