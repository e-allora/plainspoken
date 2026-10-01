# Plainspoken

A prompting improvement site.

You type what you want in your own words. It rewrites that into a prompt an AI will
actually understand, then explains what it changed and why — so you gradually stop
needing it.

Built for people who keep being told this technology will change everything, and who
have so far found it mostly annoying.

---

## Run it

```bash
cp .env.example .env.local     # add your OPENROUTER_API_KEY
pnpm install
pnpm dev
```

Port 3000 is taken by Open WebUI on the original dev machine, so Next will pick another
port — watch the terminal for the URL.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (routing, validation, rate limiting) |
| `pnpm test:e2e` | Playwright, desktop + mobile, API mocked |
| `pnpm test:smoke` | Hits the real OpenRouter API — costs credit |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |

## Environment

| Variable | Required | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | Server-side only. Never prefix `NEXT_PUBLIC_`. |
| `OPENROUTER_MODEL` | No | Force a different model, e.g. for testing. Every request asks for zero data retention, so a model with no zero-retention provider (many free ones) will fail. Unset = `anthropic/claude-haiku-4.5`. |
| `SITE_URL` | No | Public URL, sent to OpenRouter for attribution. |

## Which model, and what happens to the words

Every rewrite uses `anthropic/claude-haiku-4.5`. Per-intent routing was removed on
2026-10-01: keyword detection sent real prompts to the wrong model ("an error on my
mortgage statement" went to a code model), and a rewriter doesn't benefit from it.
`lib/routing.ts` still detects intent for the response payload.

If the user picks a category in the UI, it is passed to the rewriter as a hint.
Automatic detection is not, because it's too unreliable to steer the rewrite.

Every request to OpenRouter sends `provider: { zdr: true, data_collection: "deny" }`, so
it's routed only to providers with a zero-data-retention policy. The site itself stores
no prompts and no rewrites. That's a design decision, not a missing feature. See
[the 2026-10-01 review](docs/2026-10-01-devils-advocate-review.md).

## Documentation

Written as dated documents; the trail of changes lives in the record, not in edits.

| Document | Read it for |
|---|---|
| [Build report](docs/2026-07-14-build-report.md) | What was here, what got built, every decision and why |
| [Architecture](docs/2026-07-14-architecture.md) | Request flow, API contract, CSS contracts, gotchas |
| [Supabase plan](docs/2026-07-14-supabase-integration-plan.md) | The original logging spec. Superseded: prompts are not stored (see the review below) |
| [Deployment](docs/2026-07-14-deployment.md) | Vercel, Cloudflare, headers, renaming |
| [Review, 2026-10-01](docs/2026-10-01-devils-advocate-review.md) | Critical review: zero retention, single model, honesty rules, what's next |

The original brief is `Breakdown for the AGENTS.txt`. It names Prompt Cowboy
(promptcowboy.ai) as the inspiration; Plainspoken's design and code are its own.

Three DataCamp articles used as reference during the build (`LLMops.md`, `MLopsTools.md`,
`integration-testing.md`) were removed from the repository on 2026-10-01. They are
DataCamp's copyrighted work, not ours to publish, and the MIT license never covered
them. They remain in the early commit history, with their authors credited.

## Status

Live at [plainspoken.site](https://plainspoken.site). No accounts and no stored prompts,
by design. The original brief's auth and usage logging are not planned.

## License

Code: MIT. See [LICENSE](LICENSE). Free to use, copy, and adapt.

Writing (the lessons in `lib/lessons.ts` and the page text): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Reuse it with credit.
