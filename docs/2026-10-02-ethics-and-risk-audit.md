# Ethics, credibility and risk audit — 2 October 2026

Author: Claude, in a Claude Code session, at the site owner's request.
Branch: `claude/amazing-gates-qs7e2d`. Reviewed `main` as of the 2026-10-01 Batch 2 merge, plus a real-browser run of the production build.
Not reviewed: the live site at plainspoken.site. This session's network policy blocked it (see "What I couldn't check").

The ask: audit the site so it is ethical, transparent and helpful, and so nothing in it can become a reputational problem. Cover ethics, credibility, psychological safety, accuracy, and anything else that could hurt.

The standard the 2026-10-01 review set: every transparency claim must be backed by evidence a stranger can check. This audit holds the site to that. Section 2 is the evidence.

---

## 1. Bottom line

Plainspoken already does what most small AI tools don't. It tracks nobody (measured, below), stores nothing, says what it can't promise, and links sources for its factual claims. Nothing in the audit makes it unsafe to run.

It did find six things that could have embarrassed it. Five are fixed on this branch. One only the owner can fix.

| # | Finding | Status |
|---|---|---|
| 1 | Third-party copyrighted material is still downloadable from the repo's public git history, and there is more of it than the README says. | **Needs the owner.** Details and a tested removal procedure were handed to him privately (a public list of what to download is the wrong place for it). |
| 2 | Two log lines could have put a visitor's words into Vercel's runtime logs, contradicting "this site doesn't store your words". | **Fixed**, with tests that fail on the old code. |
| 3 | A lesson misdescribed how the government obtained chats in a real court case that names a real company, and another used a real business's name in a complaint example. | **Fixed.** |
| 4 | Nothing near the box said where your words go. The result didn't say an AI wrote it. Nothing paused someone who typed a Social Security number, or who wrote something that reads as distress. | **Fixed.** |
| 5 | Text contrast failed WCAG AA across the site: 64 failing elements on 20 of 26 page loads. | **Fixed**, with a test on the real colour tokens. |
| 6 | `next` 16.2.10 carried 3 critical advisories. None looked exploitable on this site, but anyone can run `pnpm audit` on a public repo and see them. | **Fixed** (upgraded). |

---

## 2. Claims ledger

Every checkable claim the site makes, what supports it, and where it stands.

### What the site says about itself

| Claim | Evidence | Status |
|---|---|---|
| No ads, no tracking, no analytics | 26 page loads (13 routes, desktop and phone) in Chromium against the production build: **0** requests to any other origin, **0** cookies, **0** localStorage or sessionStorage keys, **0** service workers. Fonts come from the site's own origin. | **Verified for the build.** A platform setting such as Vercel Analytics or Speed Insights is added at deploy time and would not show in a local build. Check the live site (section 7). |
| No accounts, no database | No auth or database code; no Supabase import anywhere; Supabase env vars were removed from Vercel on 2026-10-01. | Verified (code) |
| Your prompt and its rewrite aren't saved | No persistence in the code. But two `console.error` calls could have logged user text (finding 2). | **Fixed and tested** |
| Blanks you fill in stay in your browser | Typed into a blank in a real browser: localStorage, sessionStorage and cookies stayed empty. The value reaches a URL only when the person clicks "Open in". | Verified |
| Your IP address is used in memory only, to cap rewrites at 15 an hour | `lib/rate-limit.ts` is an in-memory `Map`; the IP is never logged (only two `console` calls exist in shipped code, neither logs it). | Verified (code) |
| We ask OpenRouter to use only zero-data-retention providers | `lib/improve.ts` sends `provider: { zdr: true, data_collection: "deny" }`; a unit test asserts it on every request. | Verified **for the request**. OpenRouter's enforcement, and its docs, could not be re-read from here (blocked). /about already says this is a promise we can ask for and can't inspect. |
| Rewrites run on Claude Haiku, an Anthropic model, via OpenRouter | `lib/routing.ts` maps every intent to `anthropic/claude-haiku-4.5`; tested. | Verified |
| "Open in ChatGPT / Claude" puts your prompt in the link | In the browser, the link's `?q=` carries the encoded prompt, with `rel="noopener noreferrer"`. | Verified |
| The hourly cap is per server, so looser than it sounds | True. Also: the limiter keys on the first `X-Forwarded-For` hop, so anyone reaching the app without a proxy that overwrites it can bypass it. Tested locally: the 16th request was blocked, a spoofed header got through. Vercel overwrites the header (per its docs, not checked here). | Verified, and honest. The real backstop is the OpenRouter spend cap (section 7). |
| Code is MIT; lessons and page writing are CC BY 4.0 | `LICENSE`; README. | Verified |
| Built with Claude Code; Claude wrote most of the code | Commit trailers credit Claude on every Claude-assisted commit. | Verified. The model-version list on /about was replaced (see section 4). |
| No money, sponsors or investors; run by one person | The owner's statement. Consistent with the repo; nothing in code can confirm it. | Owner's statement |
| Inspired by Prompt Cowboy; "design and code are its own" | The owner's statement. The design in the repo (legal pad, red pen) is visibly distinct. Originality can't be verified from here. | Owner's statement. See finding 1. |
| Rewrites can be wrong; read yours | On /about. Now also on the result itself. | Verified, improved |

### What the lessons say about the world

| Claim | Evidence | Status |
|---|---|---|
| Anthropic: heavy-handed role prompting is often unnecessary | Fetched the cited page directly: "modern models are sophisticated enough that heavy-handed role prompting is often unnecessary". Page title "Best practices for prompt engineering for 2026", dated 10 Nov 2025. It also lists cases where a role helps, which the lesson says too. | Verified |
| Anthropic: give the AI permission to express uncertainty | Same page: "Give the AI explicit permission to express uncertainty rather than guessing. This reduces hallucinations and increases reliability." | Verified |
| Mata v. Avianca (2023): lawyers fined, six invented cases, ChatGPT said they were real | S.D.N.Y., Judge Castel, 22 June 2023. A $5,000 penalty imposed jointly on two lawyers and their firm; six nonexistent cases. Confirmed from several summaries of the opinion. The opinion itself and the cited Wikipedia page were not reachable from here. | Verified, wording fixed (it is one fine on three parties, not "$5,000" each) |
| United States v. Heppner (Feb 2026): chats with Claude not privileged | Real S.D.N.Y. ruling by Judge Rakoff. Oral ruling 10 Feb, written opinion 17 Feb 2026. The court cited the consumer privacy policy, including disclosure to "governmental regulatory authorities". Commentators, including the Harvard Law Review post the lesson cites, criticise the reasoning. Confirmed from several law-firm and commentary write-ups. The cited post itself could not be opened from here. | Verified, **one phrase was wrong** (finding 3) |
| Home page: "Why it goes wrong" | Four generalisations ("it doesn't ask", "most wasted time", "will make one up") that current assistants sometimes contradict. | Softened to what the evidence supports |

---

## 3. Findings, in order of how much they matter

### 1. Third-party material in the public git history — needs the owner

The README says three DataCamp articles "remain in the early commit history". The history holds more than that: more DataCamp material than the README lists, other copyrighted documents, an MIT-licensed project copied without its licence text, and dozens of images collected from a search engine that show other companies' sites. Removing files from the latest commit does not remove them from history. Anyone can still check them out, and the repo is public.

Why it matters: it contradicts the README's own sentence ("not ours to publish"), it can be taken down by a rights holder in a way that disables the whole repo, and it gives anyone who wants to say "they copied" something to point at. The repo has 0 forks, 0 stars and 0 issues today, so removal is as cheap as it will ever be.

What I did: nothing to the history. Rewriting it is destructive and changes every commit ID, so it is the owner's call. I inventoried what is there, tested a removal on a throwaway copy (the site's files came out byte-for-byte identical), and wrote the steps down. They are in the private handoff, not here.

One order-of-operations point that does belong here: do the history decision **after** merging or closing every open branch. A branch cut before a purge brings the old history back if it is merged afterwards.

### 2. Log lines that could contradict "we store nothing" — fixed

- `lib/improve.ts` logged the full response body whenever OpenRouter returned an error. Some provider errors, moderation rejections for one, echo a fragment of the input back.
- `app/api/improve/route.ts` logged the raw error object. A `JSON.parse` failure quotes the start of its input. With the old code the log line was: `[improve] unexpected error SyntaxError: Unexpected token 'h', "help me write to Dana … SSN 123-45-6789" is not valid JSON`.

Vercel keeps runtime logs. Now upstream failures log `status=<n> code=<c>` only (the code must be a number or a short identifier), and unexpected errors log the error's name only. Eight new tests simulate both leaks and assert none of the words reach `console`. I ran them against the old code to confirm they fail there (4 failures, showing the leaked text) and pass on the new.

I recalled the moderation-echo behaviour from OpenRouter's error docs but couldn't re-read them from here. The fix doesn't depend on it: logging an upstream body from a service that processes people's words is the wrong default for a site that promises not to keep them.

### 3. Lesson facts and a real business's name — fixed

- **"prosecutors were allowed to obtain them"** is how the Heppner lesson described the outcome. The FBI had seized the defendant's own devices with a search warrant; the question was whether the material was privileged. As written it reads as if the AI company handed over data, which is not what happened and which names a real company. It now says what happened, says the ruling concerned the *consumer* version of Claude, and says the court cited disclosure to "government regulators".
- **"Brightway Furniture"**, the supplier in the "give it the facts" example, is the exact name of at least two real furniture businesses (in India and in Cambodia), with a similarly named cleaning firm in Texas, and the example is a complaint that they didn't deliver. It is now "Example Furniture Co."
- Mata is one $5,000 fine on two lawyers and their firm, not "$5,000" on "two lawyers". The court's docket is now a source next to Wikipedia.
- Lessons that cite sources now say "Facts and sources last checked: October 2026".

### 4. Nothing at the point of use — fixed

On the home page, a person could read the whole form without learning that their words go to a third party. The only mentions were in the footer and on /about. Now: a note under the button says the words go to an AI service, that this site doesn't keep them, that we ask the service not to either, and what to leave out. The result says an AI wrote it and it can be wrong, and that "Open in" sends the prompt to that company. The footer disclosure went from 12 px at 60% opacity to 14 px at 80%.

Also fixed: lesson 3 told people to add "names, numbers" with no pointer to the lesson that says to leave real ones out. And the footer names Claude and Anthropic on every page, so it now says plainly that Plainspoken is independent and not affiliated with or endorsed by Anthropic, OpenAI, Google or OpenRouter.

### 5. Sensitive input and people who may be struggling — fixed

Two real risks in one open text box that says "Say it however it comes out":

- Someone types their Social Security number, a card number or a password. The lesson tells them not to, and then the site sends it.
- Someone writes something that isn't really a prompt. A screenshot of a person in distress getting a cheerfully "improved" prompt is the worst case this site can produce.

`lib/guard.ts` now checks the text in the browser before sending. For card or ID numbers and secrets, a notice says why it matters and offers "Edit what I wrote" or "Send it anyway". For wording that may mean self-harm, a short plain notice gives 988 (US, a `tel:` link) and findahelpline.com (elsewhere), says plainly that this tool only rewrites prompts and can't help with that, and offers "Edit what I wrote" or "Continue with the rewrite". Nothing is forced, stored or sent; focus moves to the notice; /about says the page does this.

Limits, stated plainly: it is English-only; it favours precision, so unformatted nine-digit numbers and all-letter passwords are not caught; and a false positive costs one click (an essay about suicide prevention will show the notice). It is a courtesy, not a security boundary. I tested it against 14 ordinary prompts that must raise nothing (phone numbers, order numbers that fail the card checksum, "sk-learn" pipelines, "the password is required", "dying to try this recipe") and against 22 that must.

When the AI declines a request, the page used to say "something we couldn't read, please try again". A refusal comes back as plain text, not the JSON the site asks for, so retrying can't help, and each retry uses the person's 15 an hour. It now says: "We couldn't turn that into a rewrite. Try wording it differently. If it keeps happening, the AI may not be willing to help with that request."

### 6. Accessibility — fixed

axe-core (WCAG 2.0 to 2.2, A and AA, plus best practice) over all 13 routes at desktop and phone width found one rule failing, widely: `color-contrast`, 64 elements on 20 of 26 page loads. I computed the cause from the palette:

| Text | Before | After | Needs |
|---|---|---|---|
| Small grey text (`ink-faint`) on the desk | 2.88 | 4.80 | 4.5 |
| Small grey text on the pad (box label, counter, read time) | 3.23 | 5.39 | 4.5 |
| Textarea placeholder | 1.91 | 5.39 | 4.5 |
| Fill-in blank labels (the words you must read to fill them in) | 2.65 | 5.55 | 4.5 |
| Red links and eyebrow labels (`pen`) on the desk | 3.98 | 4.68 | 4.5 |
| Primary button text on red | 4.47 | 5.25 | 4.5 |

After the fix, the same axe run reports zero violations on every page and in the result state. All 23 tab stops on the home page show a focus ring, and there is no horizontal scroll at 320 px (both were already true). Also: the select and example chips got a visible outline (they were 1.3:1), the scroll to the result honours reduced-motion (a script-requested smooth scroll ignores the CSS rule that was already there), and focus moves to the result heading so screen-reader users are told it arrived.

`lib/contrast.test.ts` reads the real tokens from `globals.css` and asserts the pairs the site uses. Against the original tokens it fails on seven pairs (the grey text on the desk, the pad and the band; the red on the desk, the pad and the blush; and the button text); against the new ones it passes. The placeholder and blank-label fixes are class changes, which a token test can't see.

axe still lists 24 "needs manual check" contrast items, all text over a gradient or a translucent surface. I computed each by hand from the tokens and they pass.

### 7. Dependencies — fixed

`pnpm audit --prod` reported 22 advisories on the shipped tree, 3 critical (Windows-host RCE; AVIF image-optimization RCE; RCE in `next/og`'s `ImageResponse`), 11 high. I judged each against how the site is built:

- Hosted on Linux, so the Windows one doesn't apply.
- `next/image` isn't used, so the AVIF one doesn't apply.
- The `ImageResponse` advisory needs attacker-controlled values inside the image. The site's preview card takes none.
- The high ones need Server Actions, middleware with i18n, or dynamic rewrites. None exist.
- The "cache confusion" advisories apply to a server-side `fetch` given a `Request` plus a different init, or to non-UTF-8 bodies. The one `fetch` here takes a URL string and a UTF-8 JSON body.

None looked exploitable here. I upgraded anyway (16.2.10 to 16.3.8, the first line with the `next/og` fix), because a public repo shows "3 critical" to anyone who looks, and because a later feature shouldn't quietly become exposed. Production advisories: **22 to 4**; all dependencies: **37 to 19, none critical**. The remaining production four (`nanoid`, `browserslist` twice, `baseline-browser-mapping`) sit inside Next's own build-time toolchain and no visitor request reaches them. I added no overrides: overriding a framework's internals is riskier than those advisories. They clear when Next updates its own pins.

---

## 4. Wording changes to know about

Made for clear reasons, but they are the owner's voice, so each is easy to revert:

- /about no longer lists model versions with "the newest model available each time". The September and October entries matched commit trailers, but "Opus 4.8" rested on a self-description in a build report, and the list was already out of date. It now says Claude wrote the code, drafted the lessons and most page text, that "Why I built this" is Rob's own words, and that the public history credits Claude on each change it helped write.
- "Criticism is welcome when it comes with a reason" now reads as an invitation, including for privacy, safety and uncredited-work concerns, and says a short note is fine. The old wording reads as gatekeeping to someone reporting a harm.
- "your mom" and "my 70-year-old dad who has never used a computer" became "an expert / a beginner" and "someone who's never used a computer". The old versions stereotype the people the site is for.
- "A crutch" became "training wheels", and "Not blindly" became "Not without checking".
- "Will follow", "would rather guess than ask", "fills every gap", "most wasted time" and "separates people who get a lot out of these tools from people who give up" became what the evidence supports ("usually", "often", "may"). A sceptical reader can test these, and current assistants often return a template with blanks instead of inventing a shop, and often do ask clarifying questions.

---

## 5. What I changed

In order, each a separate commit:

1. Upgrade Next.js 16.2.10 to 16.3.8 to clear production advisories
2. Stop logging upstream error bodies and raw errors
3. Say where words go at the moment they're sent; add independence notice
4. Pause before sending card/ID numbers or passwords; offer support if someone may be struggling
5. Fix text contrast and other accessibility gaps
6. Correct and soften lesson and page claims
7. Say plainly when the AI gives no rewrite; fix stale config and docs

Checks, all run, all green: typecheck, lint, **129** unit tests (was 50), production build (same 19 pages), **46** Playwright tests on desktop and phone (was 28), and a re-run of the axe harness against a fresh production build.

Also in this change: `.env.example` suggested `OPENROUTER_MODEL=openrouter/free` "costs nothing". Free models often log or train on prompts, which is the opposite of the promise, and it still described per-intent routing removed on 2026-10-01. It also listed Supabase keys as "not wired up yet", an invitation to a future session. All three are corrected. The Supabase plan (a ready-made recipe for a table that stores prompt text) now carries a "superseded, do not build" banner, and the other July docs carry one-line status notes. Their bodies are untouched, in keeping with the repo's dated-records rule.

---

## 6. Left alone, on purpose

Smaller things I judged not worth changing unasked. Each is easy to pick up:

- **No privacy policy or terms page.** The "How this site works" section is plain and accurate, and is the right basis. It is not a legal privacy notice (it has no contact route for rights requests, no legal basis, nothing on transfers to the US or on age). Whether you need one depends on who uses the site and where. A lawyer's glance is cheap next to a complaint.
- **No age statement.** The upstream services' terms on minors couldn't be read from here. Worth one line on /about once you've checked them.
- **Default 404 page, `X-Powered-By` header, no Content-Security-Policy, no `security.txt`.** Normal for a site this size. A CSP needs per-request nonces to work with Next's inline scripts (the deployment doc says the same). `security.txt` needs the contact address from section 7.
- **"Open in" links with very long prompts.** A prompt that encodes to more than about 8,000 characters (long non-Latin text) may fail on the other site. "Copy prompt" always works.
- **The result's language isn't marked** when the rewrite comes back in another language (WCAG 3.1.2). The guard is English-only, and the examples are US-centric (401k, Social Security).
- **"We" and "on his own".** /about explains it. Some readers will notice.
- **The 2026-10-01 review** has a typo (line 126, "(2023; ,000 sanction;": the shell ate `$5`; it was $5,000) and a stray "Plan mode only lets me write here" line. It is a dated record, so I haven't edited it.
- **`next dev` now writes `AGENTS.md` and `CLAUDE.md`** into the project root when it detects an AI coding agent. Next 16.3 does it (see `node_modules/next/dist/server/lib/generate-agent-files.js`). I deleted the generated copies rather than commit them. Commit them if you want agent guidance in the repo; otherwise add them to `.gitignore`.

---

## 7. What I couldn't check, and what to do about it

This session's network policy blocked plainspoken.site, openrouter.ai, harvardlawreview.org, Wikipedia and several legal sources, and there is no OpenRouter key here. So I could not:

- fetch or test the **live site** (headers, deployed version, whether it matches `main`);
- re-read OpenRouter's docs or check how it behaves when no zero-retention provider exists;
- open the Harvard Law Review post or Wikipedia page the lessons cite (I verified the claims from other write-ups of the same events);
- run the real model, so **how the live rewriter behaves on harmful or distressing requests is untested**. The guard and the refusal message are deterministic and tested. What the model does with, say, a request for something dangerous is not.

Tasks, roughly in the order I'd do them:

1. **Click-test every external link** in the lessons from your own machine: the Anthropic page, the Harvard Law Review post, the Wikipedia page, and the new CourtListener docket link (I took that URL from search results and couldn't load it).
2. **Run `pnpm test:smoke`** with your key (a fraction of a cent) before merging, since the rewriter's output path changed slightly. Then try five or six requests that ought to be refused (dangerous instructions, hacking, harassing a named person, self-harm methods, risky medical dosing) and see what the page shows. Tell me what you find and I'll tighten the system prompt with evidence.
3. **Vercel:** confirm Web Analytics and Speed Insights are off for this project. They are injected at deploy time and wouldn't show in a local build. Then load the live site with the Network tab open and confirm there are no requests to any other origin, or run `curl -s https://plainspoken.site | grep -o '/_vercel[^"]*' | sort -u` and expect nothing, or only things you recognise.
4. **OpenRouter:** confirm prompt logging is off for the account, and that the key's spend cap is where you want it. The cap is the real backstop for a limiter that can be bypassed.
5. **Make a project email address** (not a personal one; domain email forwarding is free at most registrars), put it in `lib/site.ts` as `contactEmail`, and /about will show it. Most of your audience can't use GitHub issues. Then add `/.well-known/security.txt` pointing at it.
6. **Decide on the history** (finding 1) after merging or closing open branches. It is the one item here that is a legal exposure rather than a polish item.
7. **Check the name.** "Plainspoken" returned nothing obviously conflicting in a quick search, but I can't search trademark registers from here. A search of the USPTO database for software classes costs nothing.
8. After deploying, check from outside: `curl -sI https://plainspoken.site | grep -iE 'x-frame|nosniff|referrer|permissions|strict-transport'` should list all five.

---

## 8. Method, for anyone repeating it

- Read every page, component, library file, test and doc in the repo, and the full git history, including the early upload commits.
- Built the production site and drove it in headless Chromium with the API mocked (no key, no cost). Recorded every network request by origin, every cookie, and localStorage and sessionStorage after typing, and the document headers. Ran axe-core 4.13 on all 13 routes at 1280 px and 390 px, plus the result state, and measured reflow at 320 px and the focus indicator on every tab stop.
- Computed WCAG contrast for every text and background pair from the tokens in `globals.css`.
- Fetched the Anthropic page directly. Verified the court cases from search results and summaries (other sources were blocked), and said so where it applies.
- Ran `pnpm audit` before and after, and read each advisory against how the site is built.
- Scanned the full history for secrets (regex, and the file list for `.env` and keys): none, only the `sk-or-v1-...` placeholder in `.env.example`.
- Each fix that has a test was shown to fail without the fix and pass with it.
