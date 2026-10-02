# Architecture — 14 July 2026

> **Status note, 2026-10-02.** The "Model routing" section below is historical. Every
> request now uses one model, `anthropic/claude-haiku-4.5`, and the "insertion point:
> persist usage to Supabase" step was dropped because prompts are not stored. See
> `README.md` ("Which model, and what happens to the words").

How a request actually flows, and where each decision lives.

---

## Request flow

```
Browser
  │  POST /api/improve  { prompt, intent }
  ▼
app/api/improve/route.ts
  │  1. checkRateLimit(ip)          lib/rate-limit.ts    → 429 if over
  │  2. validatePrompt(body.prompt) lib/improve.ts       → 400 if bad
  │  3. validateIntent(body.intent) lib/improve.ts       → 400 if unknown
  │  4. improvePrompt(prompt, intent)
  │       ├─ routePrompt()          lib/routing.ts       picks the model
  │       └─ fetch OpenRouter       45s timeout, JSON mode
  │  5. (insertion point: persist usage to Supabase — not wired)
  ▼
  { improvedPrompt, improvements[], intent, modelUsed, usage, requestId }
```

The OpenRouter key is read only inside `lib/improve.ts`, which is imported only by the route handler. It is never bundled to the browser.

## The API contract

The spec fixed this shape; it is implemented as written, with `improvements` added to carry the teaching layer.

**Request**
```jsonc
{
  "prompt": "help me write an email to my landlord",  // 3–2000 chars after trim
  "intent": "auto"  // auto | write | analyze | code | image | general
}
```

**Response 200**
```jsonc
{
  "improvedPrompt": "You are a professional tenant...",
  "improvements": [
    { "label": "Added a role", "why": "Plain-language reason." }
  ],
  "intent": "write",
  "modelUsed": "anthropic/claude-haiku-4.5",
  "usage": { "tokens": 673, "costUsd": 0.00217 },
  "requestId": "gen-..."
}
```

**Response 4xx/5xx**
```jsonc
{ "error": "A sentence safe to show a non-technical user." }
```

Every error path returns this shape. Upstream detail is logged server-side only.

| Status | Meaning |
|---|---|
| 400 | Prompt missing, too short, too long, or unknown intent |
| 429 | Per-IP hourly limit reached (`Retry-After` set) |
| 502 | OpenRouter failed or returned unparseable JSON |
| 503 | No API key configured, or account out of credit |
| 504 | OpenRouter timed out or was unreachable |

## Model routing

`lib/routing.ts`. Deterministic by design — the spec required routing be unit-testable, which rules out randomness or time dependence.

| Intent | Model | Chosen because |
|---|---|---|
| `code` | `mistralai/devstral-2512` | Code-specialised, named in the spec |
| `image` | `google/gemini-2.5-flash` | Strong at visual description |
| `write` / `analyze` / `general` | `anthropic/claude-haiku-4.5` | Best plain-language explanations, cheap |

An explicit intent from the UI always beats detection — the user stays in control.

Detection matches on **word boundaries**, so "scripture" does not match "script" and "apiary" does not match "api". Order is specificity-first: `code` is checked before `write`, so "write a python function" routes to code. Unmatched input falls back to `general`.

To add an intent: extend the `Intent` union, add a model to `MODELS`, add keywords to `INTENT_KEYWORDS`, add a case to `lib/routing.test.ts`, add an option to `CATEGORIES` in `components/improver.tsx`.

## Rate limiting

`lib/rate-limit.ts`. Fixed window, 15 requests per IP per hour, in-memory `Map`.

**Known ceiling:** on serverless each instance holds its own counter, so the real limit is looser than configured. This guards a modest API budget against casual abuse; it is not a billing control. Swap the `Map` for Upstash/Redis if that stops being true. The eviction path caps tracked IPs at 10,000 so the map cannot grow without bound.

Client IP comes from `x-forwarded-for`, which Vercel and Cloudflare set. Spoofable if the app is ever served without a proxy in front.

## Why the model returns JSON

`improvePrompt` asks for `response_format: { type: "json_object" }` and a fixed shape. The parser tolerates a stray ```json fence, rejects anything unparseable with a user-safe 502, and filters `improvements` down to well-formed entries (max 4). A malformed model response can never reach the UI as a crash.

The system prompt forbids inventing specifics. Where a real detail is missing the model inserts `[a bracketed blank]`, and the UI explains those when present — this is what keeps the tool honest for a beginner who wouldn't spot a fabricated date.

## Rendering

| Route | Mode |
|---|---|
| `/`, `/about`, `/learn` | Static |
| `/learn/[slug]` | Static, prerendered via `generateStaticParams` |
| `/api/improve` | Dynamic (Node runtime) |

Only `components/improver.tsx` is a Client Component; everything else renders on the server.

## Styling

Tailwind v4, tokens defined in `@theme` in `app/globals.css`. No hardcoded colours in components.

Two CSS contracts worth knowing:

- **`.pad`** — a sheet: colour, edge, shadow. No rules. Safe anywhere.
- **`.pad-ruled`** — the ruled writing surface. Carries no vertical padding, and every text child **must** use `.on-rules` (line-height `1.75rem`, matching the rule pitch). Break that and the rules strike through the text instead of sitting under it. This is why labels live outside ruled blocks.

## Testing

| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest (`lib/**/*.test.ts`) | Routing, validation, rate limiting |
| E2E | Playwright (`e2e/`) | Real browser, desktop + mobile, API mocked |
| Live | Vitest (`*.smoke.test.ts`) | Real OpenRouter, opt-in via `RUN_SMOKE=1` |

E2E mocks `/api/improve` deliberately: hitting the real endpoint would cost credit, trip the rate limiter, and return different words every run. The live path has its own opt-in smoke test so it is still covered.

## Environment quirks on this machine

Two workarounds exist for local conditions, both documented in the files themselves:

- **`next.config.ts` pins `turbopack.root`.** `/home/user` is itself a pnpm project ("ollama-desktop"), so Turbopack inferred the wrong workspace root and failed to resolve `next`.
- **`.npmrc` sets `verify-deps-before-run=false`.** For the same reason, every `pnpm run` here triggered a dependency check against that parent project and failed on its unapproved build scripts.

Neither is needed if the repo is cloned somewhere that isn't nested inside another pnpm project.
