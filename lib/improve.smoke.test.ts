/**
 * Live smoke test — calls the real OpenRouter API and costs real credit.
 * Skipped unless RUN_SMOKE=1, so `pnpm test` stays free and offline.
 *
 *   RUN_SMOKE=1 npx vitest run lib/improve.smoke.test.ts
 */
import { describe, expect, it } from "vitest";
import { improvePrompt } from "./improve";

const live = process.env.RUN_SMOKE === "1" ? describe : describe.skip;

live("improvePrompt (live)", () => {
  it(
    "rewrites a beginner prompt and explains the changes",
    async () => {
      const result = await improvePrompt(
        "help me write an email to my landlord about my broken heater",
      );

      console.log("intent:", result.intent, "| model:", result.modelUsed);
      console.log("improved prompt:\n" + result.improvedPrompt);
      console.log("improvements:", JSON.stringify(result.improvements, null, 2));
      console.log("usage:", JSON.stringify(result.usage));

      expect(result.improvedPrompt.length).toBeGreaterThan(20);
      expect(result.improvements.length).toBeGreaterThan(0);
      expect(result.intent).toBe("write");
    },
    60_000,
  );

  it(
    "detects a coding prompt (all intents share one model since 2026-10-01)",
    async () => {
      const result = await improvePrompt("my python script keeps crashing");
      console.log("intent:", result.intent, "| model:", result.modelUsed);
      expect(result.intent).toBe("code");
      expect(result.improvedPrompt.length).toBeGreaterThan(20);
    },
    60_000,
  );

  it(
    "answers in the language the user wrote in",
    async () => {
      const result = await improvePrompt("ayúdame a escribir una carta a mi casero sobre la calefacción rota");
      console.log("improved prompt (es):\n" + result.improvedPrompt);
      expect(result.improvedPrompt).toMatch(/\b(de|la|el|que|para)\b/i);
    },
    60_000,
  );

  it(
    "adds honesty lines for high-stakes topics, on the single model",
    async () => {
      const result = await improvePrompt(
        "there is an error on my mortgage statement, help me write to the bank",
      );
      console.log("model:", result.modelUsed);
      console.log("improved prompt (stakes):\n" + result.improvedPrompt);
      expect(result.modelUsed).toBe("anthropic/claude-haiku-4.5");
      expect(result.improvedPrompt).toMatch(/sure|source|invent|verify|check/i);
    },
    60_000,
  );
});
