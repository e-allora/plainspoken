import { describe, expect, it } from "vitest";
import { MODELS, detectIntent, routePrompt, type Intent } from "./routing";

describe("detectIntent", () => {
  const cases: ReadonlyArray<[string, Intent]> = [
    ["write a python function that reverses a list", "code"],
    ["my react component has a bug", "code"],
    ["fix this SQL query", "code"],
    ["draw a logo for my bakery", "image"],
    ["a photo of a cat wearing a hat", "image"],
    ["compare these two health insurance plans", "analyze"],
    ["summarize this article for me", "analyze"],
    ["write a thank you email to my landlord", "write"],
    ["help me with a blog post about gardening", "write"],
    ["what should I have for dinner", "general"],
    ["", "general"],
  ];

  for (const [prompt, expected] of cases) {
    it(`classifies ${JSON.stringify(prompt)} as ${expected}`, () => {
      expect(detectIntent(prompt)).toBe(expected);
    });
  }

  it("is case-insensitive", () => {
    expect(detectIntent("DEBUG MY PYTHON SCRIPT")).toBe("code");
  });

  it("is deterministic across repeated calls", () => {
    const prompt = "write a python function";
    const results = Array.from({ length: 5 }, () => detectIntent(prompt));
    expect(new Set(results).size).toBe(1);
  });

  it("matches whole words only, not substrings", () => {
    // "scripture" contains "script" but must not route to code.
    expect(detectIntent("what does this scripture mean")).toBe("general");
    // "apiary" contains "api".
    expect(detectIntent("tell me about my apiary")).toBe("general");
  });

  it("prefers code over write when both signals are present", () => {
    expect(detectIntent("write a script to rename files")).toBe("code");
  });

  it("handles keywords containing regex metacharacters", () => {
    expect(detectIntent("make a dall-e prompt")).toBe("image");
  });
});

describe("routePrompt", () => {
  it("uses OPENROUTER_MODEL for every intent when set", () => {
    process.env.OPENROUTER_MODEL = "openrouter/free";
    try {
      expect(routePrompt("debug my python script").model).toBe("openrouter/free");
      expect(routePrompt("debug my python script").intent).toBe("code");
      expect(routePrompt("anything", "write").model).toBe("openrouter/free");
    } finally {
      delete process.env.OPENROUTER_MODEL;
    }
  });

  it("ignores a blank OPENROUTER_MODEL", () => {
    process.env.OPENROUTER_MODEL = "  ";
    try {
      expect(routePrompt("anything", "write").model).toBe(MODELS.write);
    } finally {
      delete process.env.OPENROUTER_MODEL;
    }
  });

  it("maps each intent to a configured model", () => {
    for (const intent of Object.keys(MODELS) as Intent[]) {
      expect(routePrompt("anything", intent).model).toBe(MODELS[intent]);
    }
  });

  it("lets an explicit intent override detection", () => {
    const result = routePrompt("debug my python script", "write");
    expect(result.intent).toBe("write");
    expect(result.model).toBe(MODELS.write);
  });

  it("falls back to detection when no explicit intent is given", () => {
    expect(routePrompt("debug my python script").intent).toBe("code");
  });
});

describe("MODELS", () => {
  it("uses one rewrite model for every intent (2026-10-01 decision)", () => {
    expect(new Set(Object.values(MODELS))).toEqual(new Set(["anthropic/claude-haiku-4.5"]));
  });
});
