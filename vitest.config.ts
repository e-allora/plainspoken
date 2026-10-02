import path from "node:path";
import { defineConfig } from "vitest/config";

// `pnpm test:smoke` sets RUN_SMOKE=1. Without this switch the exclude below also
// filtered out the smoke file the script asked for, so it never ran.
const smoke = process.env.RUN_SMOKE === "1";

export default defineConfig({
  // Mirrors tsconfig's "@/*" so tests can import the route handler.
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    // Unit tests only. `e2e/` belongs to Playwright, and *.smoke.test.ts calls
    // the live OpenRouter API — both are run by their own scripts.
    include: ["lib/**/*.test.ts"],
    exclude: ["**/node_modules/**", "e2e/**", ...(smoke ? [] : ["**/*.smoke.test.ts"])],
  },
});
