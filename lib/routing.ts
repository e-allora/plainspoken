/**
 * Deterministic model routing.
 *
 * Same input always picks the same model — no randomness, no time dependence.
 * This is what makes routing testable, per the build spec.
 */

export type Intent = "code" | "image" | "write" | "analyze" | "general";

/**
 * 2026-10-01: every intent uses one model. Per-intent routing came from a brief
 * for an app that *answers* prompts; this site only rewrites them, and keyword
 * detection misrouted real prompts ("an error on my mortgage statement" went to
 * the code model). One model also keeps the zero-retention promise simple.
 * See docs/2026-10-01-devils-advocate-review.md.
 */
const REWRITE_MODEL = "anthropic/claude-haiku-4.5";

export const MODELS = {
  code: REWRITE_MODEL,
  image: REWRITE_MODEL,
  write: REWRITE_MODEL,
  analyze: REWRITE_MODEL,
  general: REWRITE_MODEL,
} as const satisfies Record<Intent, string>;

/**
 * Word-boundary keyword sets. Ordered by specificity: the first intent whose
 * keywords match wins, so `code` beats `write` for "write a python function".
 */
const INTENT_KEYWORDS: ReadonlyArray<readonly [Intent, readonly string[]]> = [
  [
    "code",
    [
      "code", "coding", "program", "programming", "function", "bug", "debug",
      "script", "api", "database", "sql", "python", "javascript", "typescript",
      "java", "rust", "css", "html", "react", "regex", "algorithm", "refactor",
      "compile", "error", "stack trace", "repo", "git",
    ],
  ],
  [
    "image",
    [
      "image", "picture", "photo", "logo", "illustration", "drawing", "draw",
      "art", "artwork", "render", "midjourney", "dall-e", "stable diffusion",
      "thumbnail", "poster", "icon",
    ],
  ],
  [
    "analyze",
    [
      "analyze", "analyse", "analysis", "compare", "evaluate", "review",
      "research", "summarize", "summarise", "summary", "explain", "critique",
      "pros and cons", "data", "spreadsheet", "report",
    ],
  ],
  [
    "write",
    [
      "write", "writing", "essay", "email", "blog", "article", "story", "poem",
      "letter", "copy", "post", "caption", "script for", "newsletter",
      "resume", "cover letter",
    ],
  ],
];

/**
 * Classify free-text into an intent. Falls back to "general" when nothing matches.
 */
export function detectIntent(prompt: string): Intent {
  const text = prompt.toLowerCase();

  for (const [intent, keywords] of INTENT_KEYWORDS) {
    for (const keyword of keywords) {
      // Escape regex metacharacters (e.g. "dall-e") before building the pattern.
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`).test(text)) {
        return intent;
      }
    }
  }

  return "general";
}

/**
 * Pick the model for a prompt. An explicit intent (from the UI chips) always
 * overrides detection, so the user stays in control.
 */
export function routePrompt(prompt: string, explicitIntent?: Intent): {
  intent: Intent;
  model: string;
} {
  const intent = explicitIntent ?? detectIntent(prompt);
  // OPENROUTER_MODEL (optional) forces one model for every intent — e.g.
  // "openrouter/free" to run at zero cost. Intent detection still runs so the
  // UI keeps showing the category. Unset it to restore per-intent routing.
  const override = process.env.OPENROUTER_MODEL?.trim();
  return { intent, model: override || MODELS[intent] };
}
