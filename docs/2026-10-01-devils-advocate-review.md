# Plainspoken — devil's-advocate review and proposed fixes (2026-10-01)

> Public copy. A few personal lines were removed before publishing; each spot is marked *(removed from the public copy)*.

## Context
Rob asked for a critical look at plainspoken.site and github.com/e-allora/plainspoken: what to improve so it really helps people and so his values show — telling the truth, not keeping people's data, plain words, and teaching people so they stop needing the tool. Nothing has been changed. This file is the review plus a proposed first set of fixes. He picks what happens next.

(Plan mode only lets me write here. Once approved, step 0 copies this review into his folder as `plainspoken/docs/2026-10-01-devils-advocate-review.md`, which follows the repo's dated-docs convention. It won't be committed until he says so.)

## The point
The site makes two promises: **"we don't keep your words"** and **"we'll teach you so you stop needing us."** Right now both are only half kept, and both are cheap to fix:

1. **The data promise only covers his own server.** The request to OpenRouter (`lib/improve.ts:158-167`) doesn't ask for zero retention, so the default `data_collection: "allow"` applies. All three models have zero-retention routes: I checked OpenRouter's public list (Haiku 4.5: 6, Gemini 2.5 Flash: 7, Devstral: 1). One `provider` object makes the promise enforceable, and the site can then make a claim people can check.
2. **The teaching leaves out the lessons that matter most when the stakes are real:** (a) make the AI say when it's guessing, and check the parts that matter, because AI invents laws, case names, and deadlines; (b) what you type into an AI isn't private, and isn't like talking to a lawyer. The homepage also says the AI "won't ask a clarifying question unless you invite one" (`app/page.tsx:82-87`), but no lesson teaches inviting one, and the rewriter never adds an invitation. The site states the problem and then doesn't apply its own fix.

## Verified findings (with evidence)
| # | Finding | Evidence |
|---|---|---|
| F1 | Keyword routing sends real user prompts to the wrong model | Ran `detectIntent` on 5 prompts; 4 misrouted. "error on my mortgage statement" → **code model**. "draw up a contract", "the art of negotiating with a debt collector" → **image model**. "script for my wedding toast" → code. |
| F2 | Routing doesn't help a *rewriter*. It came from a brief written for an app that *answers* prompts | `Breakdown for the AGENTS.txt`. A coding model is no better at rewriting a non-coder's prompt. Devstral also has only 1 zero-retention route, so it's fragile. |
| F3 | No zero-retention request to OpenRouter | `lib/improve.ts:158-167`; OpenRouter docs: `data_collection` defaults to `"allow"` |
| F4 | Security headers are written down in a doc but never added to the site | `next.config.ts` has none. Live `curl -I` shows only HSTS (Vercel adds that itself). The snippet is in `docs/2026-07-14-deployment.md:49-68`. |
| F5 | The README says things that aren't true anymore | `README.md:73-76`: "Not deployed", "placeholder name". The live GitHub page shows the same. |
| F6 | The rewriter forces English | `lib/improve.ts:70` says "Write it in plain English". People who don't write in English are shut out, even though the model handles their language. |
| F7 | Every rewrite must add a role, and Lesson 4 teaches role-play as a core move | `lib/improve.ts:71`, `lib/lessons.ts:65-79`. Anthropic's own Nov 2025 guidance: "heavy-handed role prompting is often unnecessary"; "Give the AI explicit permission to express uncertainty." |
| F8 | The lessons don't sound like him; they're in British English | `lib/lessons.ts`: "your mum" (line 19), "3 March / 2 April" (60), "a shed in Leeds" (92) |
| F9 | "Fill in the [brackets]" is left to the user after copying, which is easy to skip | `components/improver.tsx:264-269` |
| F10 | A Supabase database is connected to production but nothing uses it, and the `TODO(auth)` comment still says "persist prompt" | `vercel env ls` (names only); no code imports supabase; `app/api/improve/route.ts:51-53`. A future agent could "finish the spec" and start storing prompts without anyone deciding to. |
| F11 | *(removed from the public copy: a note about local files)* | — |
| F12 | His local `.env.local` sends his test prompts to `openrouter/free` | Production doesn't set this (verified), so the live site isn't affected. Free routes often log or train on prompts. |

**A common prompt pattern worth pushing back on:** stacking roles ("legal expert… ethical advisor… bold communicator") doesn't add much. And "All claims must be backed by verifiable legal references" can push a model to *invent* citations so it looks compliant. Better wording: "If you're not sure a law or case exists, say so. Give section numbers I can look up. I'll verify." That same idea is what the new lesson below teaches.

## Batch 1 — recommended (small, low-risk, values-first)
Work on a branch (`improve/values-pass`). No push or deploy without Rob saying so.

1. **Zero retention (F3).** In `lib/improve.ts`, add `provider: { zdr: true, data_collection: "deny" }` to the request body. Update the footer (`app/layout.tsx:115-119`) and About (`app/about/page.tsx:36-42`) to a claim people can check. Suggested wording: "We ask OpenRouter to send your words only to providers with a zero-data-retention policy." Don't claim anything about what happens to the words after that (we can't see past that point, so we don't claim to).
2. **One model instead of routing (F1, F2).** Point all intents at `anthropic/claude-haiku-4.5` in `lib/routing.ts:10-16`. Pass the user's category choice to the rewriter as a hint (one line in the user message) so the dropdown still does something. Update `lib/routing.test.ts`, the README routing table, and the About and footer model lists to "Anthropic".
3. **System prompt (`lib/improve.ts:67-83`), F6/F7 + the point above:**
   - Write in the same language the user wrote in (JSON keys stay English).
   - Replace "Add a relevant role" with "Add who it's for, the context, the task, and the format; add a role only if it clearly helps."
   - For anything with real stakes (law, health, money, housing, government benefits), add a line telling the AI to say when it's unsure, not to invent laws, case names, or deadlines, and to name the official source to check.
   - When important details are probably missing, end with an invitation: "Ask me up to 3 questions first if anything important is missing."
4. **Security headers (F4).** Paste the existing snippet from `docs/2026-07-14-deployment.md` into `next.config.ts`. Leave CSP out (the doc explains why).
5. **Make the README and code tell the truth (F5, F10).** Update the README status: it's live at plainspoken.site, "Plainspoken" is the real name, and not storing prompts is a deliberate design choice, not a missing feature. Replace the `TODO(auth)` comment with that decision so no future session "finishes" it.

## Batch 2 — after Rob picks
6. **Inline blanks (F9).** Turn `[bracketed]` text into input fields before copying. Copy and the "Open in" links use the filled-in version. Runs in the browser only; no new data goes anywhere.
7. **Lessons (`lib/lessons.ts`).** Add: "Let it ask you questions", "Make it tell you when it's guessing", "What you type isn't private". Rework Lesson 4 into "Say what angle you want" and keep its honesty caveat. Switch the lessons to US English (F8). Remove the hard-coded "Six" from `app/page.tsx:105,116`, `app/learn/page.tsx`, `app/learn/[slug]/page.tsx:97`, `app/about/page.tsx:113`. Check any legal or privacy facts in the lessons against a primary source before publishing.
8. **"Try it yourself first."** Under the text box, three questions that cost nothing to run: Who's it for? What do you want back? What do you know that it doesn't? This is what actually lets people stop needing the tool. A before-and-after view that highlights what changed could follow.

## Decisions only Rob can make
- **License.** None is set, so the code is public to read but others can't legally reuse it. MIT = anyone can reuse it. AGPL = anyone who hosts a modified copy must publish their source too, which fits "trust truth is transparent."
- **About page in his own words.** Right now "Who made this?" could describe anyone. A sentence or two on *why* he built it would help. *(rest removed from the public copy)*
- **Idle Supabase project (F10).** Disconnect it, or keep it for counts only (no text).
- **Measuring help.** There are no analytics today, which fits the values. The option is a count-only "Did this help? yes/no", disclosed on /about.
- **OpenRouter spending cap.** Check whether the key has a credit limit. The rate limiter is per server instance and can be beaten, so the cap is the real backstop.
- *(removed from the public copy)*

## Verification
- `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build` all pass. The routing tests are updated for the single model, and a unit test checks that the request body includes `provider.zdr === true` (mock `fetch`).
- `pnpm test:smoke` uses real OpenRouter credit (a fraction of a cent). Ask Rob before running it. It confirms the zero-retention request still works with Haiku 4.5.
- Manual dev check: a Spanish prompt comes back in Spanish; a mortgage prompt comes back with the uncertainty and official-source lines; "error on my mortgage statement" no longer goes to the code model.
- After Rob deploys: `curl -I https://plainspoken.site/` shows `x-content-type-options`, `referrer-policy`, `x-frame-options`, `permissions-policy`.

## Sources
- OpenRouter provider routing (`zdr`, `data_collection`): https://openrouter.ai/docs/guides/routing/provider-selection
- OpenRouter zero-retention list: https://openrouter.ai/api/v1/endpoints/zdr (fetched 2026-10-01)
- Anthropic, "Prompt engineering best practices" (2025-11-10): https://claude.com/blog/best-practices-for-prompt-engineering

---

## What was done — 2026-10-01 14:30 EDT (branch `improve/values-pass`, not committed, not deployed)

Batch 1, all five items:

| Item | Change | Files |
|---|---|---|
| 1 Zero retention | Request body now sends `provider: { zdr: true, data_collection: "deny" }`. Footer and /about say only what can be checked: the site doesn't store words; we *ask* OpenRouter for zero-retention providers and can't inspect what they do. | `lib/improve.ts`, `app/layout.tsx`, `app/about/page.tsx` |
| 2 One model | All intents → `anthropic/claude-haiku-4.5`. Detection still runs but no longer picks the model. The user's explicit category is passed as a hint in the system message. | `lib/routing.ts`, `lib/improve.ts` |
| 3 Rewriter rules | Same language as the user; role only if it helps; honesty lines for law/health/money/housing/benefits; invite up to 3 questions when details are missing; explanations in the user's language, JSON keys in English. | `lib/improve.ts` |
| 4 Headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. **Changed from the plan:** HSTS left out because Vercel already sends a longer one (2 yr vs the doc's 1 yr). | `next.config.ts` |
| 5 Truth in README/code | README status, routing section, and env notes updated; `TODO(auth)` replaced with the no-storage decision. | `README.md`, `app/api/improve/route.ts` |
| (verification) | `playwright.config.ts` takes `E2E_PORT` because port 3100 is in use on this machine by another program (it answers 404). Smoke-test title renamed to match single-model routing. | `playwright.config.ts`, `lib/improve.smoke.test.ts` |

Tests added: request body asks for ZDR; mortgage-"error" prompt uses Haiku; hint present only with an explicit category; "something else" adds no hint; every intent maps to one model.

### Verification results
- `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm test` ✅ 40/40 · `pnpm build` ✅
- Local production server (`next start`, port 3107): all four new headers present; new footer and /about text render. No AI call made.
- `pnpm test:e2e` ❌ **did not run**. Playwright's browsers aren't installed (`pnpm exec playwright install` needed; it downloads to `~/.cache/ms-playwright`, outside the project, so that's Rob's call). All 18 failures are this one error, not the code.
- `pnpm test:smoke` **not run**. It uses real OpenRouter credit; it needs Rob's OK. It's the only check that zero retention + Haiku works end to end. Note: local `.env.local` sets `OPENROUTER_MODEL=openrouter/free`, which will likely fail now that ZDR is required. Unset it locally for the smoke test.

### Not done (waiting on Rob)
Commit, push, deploy; Batch 2; every item under "Decisions only Rob can make".

---

## Rob's decisions and follow-up — 2026-10-01 15:06 EDT

- **License:** MIT (`LICENSE`, `package.json`, README). Not a commercial or sponsored venture.
- **About page:** added "Why I built this" in Rob's words (lightly edited), a GitHub link, and a thank-you to his parents.
- **Supabase:** disconnected from the plainspoken Vercel project (16 `POSTGRES_*` / `SUPABASE_*` env vars removed from Production). The Supabase database itself and the team-level integration were **not** deleted; other projects may use the integration.
- **OpenRouter cap:** the key already has a $5/month limit. Rob will decide on a new cap himself.
- **Batch 2:** approved; built as a separate change after this one ships.

Fixed along the way:
- `pnpm test:smoke` could never run: `vitest.config.ts` excluded every `*.smoke.test.ts`, including the one the script asked for. Now excluded only when `RUN_SMOKE` is unset.
- **Typing before the page finished loading** left the text in the box but the counter at 0 and the button disabled (slow phones). `components/improver.tsx` now picks up early-typed text; the keyboard e2e test waits for the button to enable.

Verification: typecheck ✅ · lint ✅ · unit 40/40 ✅ · e2e 18/18 ✅ (Chromium installed inside `node_modules` via `PLAYWRIGHT_BROWSERS_PATH=0`, port 3107) · build ✅ · live smoke 4/4 ✅ (Haiku 4.5 with zero-retention routing; Spanish stays Spanish; mortgage prompt gets honesty/source lines). The smoke checks are pattern matches; the full rewritten text wasn't printed.

---

## Batch 2 — built 2026-10-01 15:12 EDT (branch `improve/batch-2`, PR #5)

- **Fill-in blanks:** each `[blank]` in a rewrite is now an input box. Copy and "Open in…" use the filled-in text; a live count shows what's left. Values stay in the browser. Logic in `lib/blanks.ts` (skips code like `arr[0]`), tested in `lib/blanks.test.ts`.
- **Try it yourself first:** a collapsed three-question self-check under the prompt box, linking to the matching lessons. No API call.
- **Lessons (now nine):**
  - Lesson 4 is now "Say what angle you want" (role-play de-emphasized per Anthropic's Nov 2025 guidance). The old URL redirects permanently.
  - New: "Let it ask you questions", "Make it tell you when it's guessing", "What you type isn't private".
  - US English throughout.
  - Lessons with factual claims carry a Sources list.
  - "Six" is no longer hard-coded anywhere.
- **Facts used, and how they were checked:**
  - Mata v. Avianca (2023; ,000 sanction; six invented cases; ChatGPT said they were real): web search, multiple sources.
  - United States v. Heppner (S.D.N.Y., Judge Rakoff, Feb 17 2026; chats with Claude not privileged; prosecutors obtained them; court cited the privacy policy): Harvard Law Review blog, read directly. The lesson says experts disagree and doesn't overstate it as settled law.
- **Not used, because unverified this session:** the NYT v. OpenAI log-preservation order, and whether consumer AI apps train on chats by default. Two web searches were blocked by a permission check.

Verification: typecheck ✅ · lint ✅ · unit 50/50 ✅ · build ✅ · e2e 26/26 ✅ (desktop + mobile).

---

## Congruence pass: 2026-10-01 15:50 EDT (PR #4, carried into PR #5)

Rob's standard: every transparency claim on his sites must be backed by evidence a stranger can check, because if any of them get attention, they'll be scrutinized. The template is aiconsumerrights.org's "How this site works" page. The cross-site report is kept outside the repo, in Rob's project folder.

- **About → "How this site works":**
  - who runs it (no money, ads, tracking, or analytics)
  - every service and what it sees (Vercel sees IPs; the IP is used in memory for the 15/hour cap; OpenRouter zero retention is worded as a request we can't inspect; the "Open in" links send the prompt to that company)
  - what we keep (nothing)
  - how it was built (models per the commit records: Opus 4.8 / Fable 5.1 / Opus 5.5)
  - what isn't finished
  - how to report a mistake (GitHub issues, confirmed enabled)
  - The footer links to it.
- **Licenses:** code MIT; lesson and page writing CC BY 4.0, the same split as aiconsumerrights.
- **Prompt Cowboy** is credited as the inspiration.
- **Three DataCamp articles are no longer tracked** (`LLMops.md`, `MLopsTools.md`, `integration-testing.md`). They're DataCamp's copyrighted work and must not look like they're under this repo's MIT license. They're kept on disk and ignored by git. They remain in early history, with their authors credited. No history was rewritten.

Verification (PR #5 branch, after the merge): typecheck ✅ · lint ✅ · unit 50/50 ✅ · build ✅ · e2e 28/28 ✅
