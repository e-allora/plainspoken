import { defineConfig } from "vitest/config";

// `pnpm test:smoke` sets RUN_SMOKE=1. Without this switch the exclude below also
// filtered out the smoke file the script asked for, so it never ran.
const smoke = process.env.RUN_SMOKE === "1";

export default defineConfig({
  test: {
    // Unit tests only. `e2e/` belongs to Playwright, and *.smoke.test.ts calls
    // the live OpenRouter API — both are run by their own scripts.
    include: ["lib/**/*.test.ts"],
    exclude: ["**/node_modules/**", "e2e/**", ...(smoke ? [] : ["**/*.smoke.test.ts"])],
  },
});
