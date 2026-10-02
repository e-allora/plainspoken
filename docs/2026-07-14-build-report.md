# Build Report — 14 July 2026

> **Status note, 2026-10-02.** Written at the first build. Since then the site has been
> deployed, renamed from the placeholder to Plainspoken, moved to a single model, and
> made to store nothing. This report is kept as the record of the first build. See the
> 2026-10-01 review and the 2026-10-02 audit for what changed.

Author: Claude (Opus 4.8), autonomous session
Branch: `feat/prompt-site-mvp`
Status: working application, deployable, not yet deployed

---

## 1. What was here when I started

The repository contained **reference material only — no application code**.

| Item | What it is |
|---|---|
| `Breakdown for the AGENTS.txt` | A detailed, well-formed build spec (stack, flow, data contract, test gates) |
| `PromptCowboy.ai-RealUXPHOTOS/` | 23 low-resolution reference images |
| `OtherSimilarPromptImprovementSites/` | 12 competitor reference images |
| `agentic-coding-rulebook-main/` | Prompting best-practice notes |
| `BestPractices-DataCamp.md`, `LLMops.md`, `MLopsTools.md`, `integration-testing.md` | Long-form reference documents |
| `README.md` | Two lines |

Git history is eight commits, all document uploads. **No prior session left any code in this repository.** Whatever the "agency agents" produced yesterday did not land here — there is no branch, stash, or dangling commit containing it. Nothing was deleted to make room; every original file is untouched.

The spec in `Breakdown for the AGENTS.txt` is good and this build follows it.

## 2. What now exists

A working Next.js application: paste a rough prompt, get back a rewritten one **plus a plain-language explanation of every change**.

```
app/
  layout.tsx              Fonts, header, footer
  page.tsx                Home — hero, improver, "why it goes wrong", lesson teasers
  about/page.tsx          What it is, privacy, limits
  learn/page.tsx          Lesson index
  learn/[slug]/page.tsx   Lesson detail (statically generated)
  api/improve/route.ts    POST endpoint: rate limit → validate → route → OpenRouter
components/
  improver.tsx            The prompt box and the marked-up result
lib/
  routing.ts              Deterministic prompt → model routing
  improve.ts              Validation, OpenRouter call, response parsing
  rate-limit.ts           Fixed-window per-IP limiter
  lessons.ts              The six lessons
e2e/site.spec.ts          Playwright, desktop + mobile
docs/                     This report and its siblings
```

## 3. The one deliberate departure from the spec

The spec describes a prompt→answer tool. **This answers the prompt-writing step and hands the result to whatever AI the user already uses.** It also explains what changed and why.

The reason is the stated audience. PromptCowboy returns a better prompt and the user learns nothing; they come back forever. The brief was "help people who aren't tech savvy **learn** to utilize" the technology. So every result carries numbered margin notes explaining each change in plain language, and six short lessons cover the same ground. The tool is designed to make itself unnecessary.

This is the product's actual differentiator and it is cheap to reverse if unwanted.

## 4. Verification

Everything below was run, not assumed.

| Check | Command | Result |
|---|---|---|
| Unit tests | `pnpm test` | 33 passed |
| End-to-end | `pnpm test:e2e` | 18 passed (Chrome + Pixel 7) |
| Live API | `pnpm test:smoke` | 2 passed against real OpenRouter |
| Types | `pnpm typecheck` | clean |
| Lint | `pnpm lint` | clean |
| Production build | `pnpm build` | clean, 13 routes |

The interface was driven in a real browser and reviewed at 1440px and 390px. Two defects were found that way and fixed: rule lines striking through text on every card, and rules misaligned to the textarea baseline.

**Live output, unedited, for "help me write an email to my landlord about my broken heater":**

> You are a professional tenant writing a formal email to your landlord. I need you to draft an email requesting urgent repair of my broken heater. The email should: (1) clearly state that my heater is not working, (2) explain why this is urgent [e.g., it's winter / I have young children], (3) ask for a specific timeline for repair, and (4) remain respectful and professional. Please write the full email body, ready for me to send.

With four margin notes explaining the role, the itemised list, the output format, and the bracketed blank. Cost: **$0.002 per rewrite**.

## 5. Decisions and why

**No Supabase yet.** Auth and the database need a cloud project only the account holder can create. Rather than stall, the site works fully without login. The API route has the persistence insertion point marked, and `docs/2026-07-14-supabase-integration-plan.md` has the exact steps. This is the only part of the spec not delivered.

**Rate limiting instead of auth.** With no login, the API key needs protecting. 15 rewrites per IP per hour. In-memory, so on Vercel the limit is per instance and looser than configured — noted in the code with its upgrade path. It guards a budget, not billing.

**`mistralai/devstral-2512`, not `devstral-small-2505`.** The spec named a model ID that no longer exists on OpenRouter. Verified against their live model list and corrected.

**Model routing is keyword-based and deterministic.** Same input, same model, always — which is what makes it unit-testable, as the spec required. Word-boundary matched, so "scripture" doesn't route to the code model.

**Errors never leak upstream detail.** OpenRouter failures are logged server-side and returned as plain sentences a non-technical person can act on.

## 6. Design direction

Not a PromptCowboy copy. The subject's own world is the **marked-up draft**: your rough sentence, corrected, with the teacher's notes in the margin.

- Rough input is monospace (a draft); the finished prompt is editorial serif. The type carries the meaning.
- The writing surface is a ruled legal pad with a red margin rule. Rules appear **only** where writing happens.
- Red is the editor's pen: used for margin notes and the action that makes them, nothing else.
- Fonts: Newsreader (display), Karla (body), IBM Plex Mono (drafts). Self-hosted via `next/font`, no external CDN.

## 7. What is not done

1. **Supabase auth + usage logging** — blocked on a cloud project. Plan written.
2. **Not deployed.** No Vercel or Cloudflare account was touched. Steps in `docs/2026-07-14-deployment.md`.
3. **Rate limiting is per-instance.** Fine at low traffic; swap for Upstash if the key starts burning money.
4. **The name "Plainspoken" is a placeholder.** Chosen so the site could have a voice. Change it in `app/layout.tsx`.
5. **No analytics.**

## 8. To run it

```bash
cd ~/Documents/GitHub/PromptingSite
cp .env.example .env.local     # add your OPENROUTER_API_KEY
pnpm install
pnpm dev
```

Note: port 3000 is occupied by Open WebUI on this machine, so the dev server will pick another port. Watch the terminal for the URL.
