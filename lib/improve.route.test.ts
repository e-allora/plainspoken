import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/improve/route";
import { ImproveError, improvePrompt } from "./improve";
import { __resetRateLimits } from "./rate-limit";

// Keep the real validators and ImproveError; replace only the network call.
vi.mock("./improve", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./improve")>();
  return { ...actual, improvePrompt: vi.fn() };
});

const WORDS = "help me write to Dana Whitfield about my SSN 123-45-6789";

function request(body: unknown, ip = "198.51.100.10") {
  return new Request("http://localhost/api/improve", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/improve", () => {
  beforeEach(() => {
    __resetRateLimits();
    vi.mocked(improvePrompt).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs only the name of an unexpected error, never its message or the user's words", async () => {
    // A JSON.parse failure quotes the start of its input, which is the kind of
    // message that must never reach the logs.
    vi.mocked(improvePrompt).mockRejectedValue(
      new SyntaxError(`Unexpected token 'h', "${WORDS}" is not valid JSON`),
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request({ prompt: WORDS }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Something went wrong on our end." });

    const out = spy.mock.calls.flat().map(String).join(" ");
    expect(out).toContain("SyntaxError");
    for (const fragment of ["Dana", "Whitfield", "123-45-6789", "Unexpected token"]) {
      expect(out).not.toContain(fragment);
    }
  });

  it("returns a user-safe message and status for a known failure, without logging", async () => {
    vi.mocked(improvePrompt).mockRejectedValue(new ImproveError("The AI service had a problem. Please try again.", 502));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request({ prompt: WORDS }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "The AI service had a problem. Please try again." });
    expect(spy).not.toHaveBeenCalled();
  });

  it("sends the user's prompt to the rewriter and nowhere else", async () => {
    vi.mocked(improvePrompt).mockResolvedValue({
      improvedPrompt: "A clearer prompt.",
      improvements: [],
      intent: "general",
      modelUsed: "anthropic/claude-haiku-4.5",
    });
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((level) =>
      vi.spyOn(console, level).mockImplementation(() => {}),
    );

    const response = await POST(request({ prompt: WORDS }));

    expect(response.status).toBe(200);
    expect(vi.mocked(improvePrompt)).toHaveBeenCalledWith(WORDS, undefined);
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });

  it("answers 429 with Retry-After once an address has used its allowance", async () => {
    vi.mocked(improvePrompt).mockResolvedValue({
      improvedPrompt: "ok",
      improvements: [],
      intent: "general",
      modelUsed: "anthropic/claude-haiku-4.5",
    });

    let last: Response | undefined;
    for (let i = 0; i < 16; i += 1) last = await POST(request({ prompt: "hello there" }, "203.0.113.5"));

    expect(last?.status).toBe(429);
    expect(Number(last?.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect((await last!.json()).error).toMatch(/Try again in about \d+ minutes/);
  });
});
