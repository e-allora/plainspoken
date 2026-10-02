# Supabase Integration Plan — 14 July 2026

> **Superseded on 2026-10-01. Do not build this as written.** Plainspoken stores no
> prompts or rewrites, by design, and tells visitors so on `/about` and in the
> footer. The `prompt_logs` table below stores prompt text, which would break that
> promise. Any future usage counting must store no text and be disclosed on
> `/about` first. See `README.md` and `docs/2026-10-01-devils-advocate-review.md`.
> The original is kept unchanged below as a record.

**Status: not implemented. Blocked on a cloud project only the account holder can create.**

The spec calls for Supabase Auth and Postgres usage logging. I built the site to work fully without them rather than stall, and left a marked insertion point. This document is the handover.

---

## Why it stopped here

Supabase needs an account, a project, and three keys. I can't create those on someone's behalf — it means accepting terms and provisioning billable infrastructure. Everything downstream of that is straightforward and specified below.

## Decide first: is auth wanted at all?

Worth a moment before building it, because the site currently works with no login and that is a real feature for a nervous beginner.

| | Anonymous (today) | With accounts |
|---|---|---|
| Friction | None | Signup before value |
| Abuse control | Per-IP, per-instance, leaky | Per-user, solid |
| Saved history | No | Yes |
| Cost tracking | Aggregate only | Per user |

**Recommendation: add the database first, auth only when history or per-user limits are actually wanted.** Logging usage anonymously answers "what is this costing me?" without putting a wall in front of the thing that makes the site good. Auth is a bigger change and can wait for a real reason.

## Step 1 — Create the project

1. supabase.com → new project. Keep the database password.
2. Settings → API. Copy the project URL, the `anon` key, and the `service_role` key.
3. Add to `.env.local`, and to Vercel's environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**The `service_role` key bypasses every access rule. Server-side only. Never prefix it `NEXT_PUBLIC_`, never import it into a Client Component.**

## Step 2 — The table

Fields are exactly those the spec required. SQL editor:

```sql
create table public.prompt_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,  -- null while anonymous
  prompt      text not null,
  response_text text,
  model_used  text not null,
  intent      text not null,
  tokens_used integer,
  cost_usd    numeric(10, 6),
  created_at  timestamptz not null default now()
);

create index prompt_logs_user_id_created_at_idx
  on public.prompt_logs (user_id, created_at desc);

alter table public.prompt_logs enable row level security;

-- Deny by default. The server writes with the service_role key, which bypasses
-- RLS. No client-side policy is granted until there is a reason.
```

Row Level Security on with no policy means **no client can read this table**, which is what you want. Adding a "users read their own rows" policy is a later step, only if history ships.

Consider whether to store `prompt` and `response_text` at all. They are the user's words. The site currently promises no account and nothing tied to a name; logging full text quietly weakens that. Dropping both columns still answers the cost question via `tokens_used` and `cost_usd`. If they stay, say so on `/about`.

## Step 3 — Write on each request

```bash
pnpm add @supabase/supabase-js
```

```ts
// lib/db.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Null when unconfigured, so the site keeps working without a database. */
const admin = url && serviceKey ? createClient(url, serviceKey) : null;

export async function logPromptUsage(entry: {
  userId?: string | null;
  prompt: string;
  modelUsed: string;
  intent: string;
  tokensUsed?: number;
  costUsd?: number;
}): Promise<void> {
  if (!admin) return;

  const { error } = await admin.from("prompt_logs").insert({
    user_id: entry.userId ?? null,
    prompt: entry.prompt,
    model_used: entry.modelUsed,
    intent: entry.intent,
    tokens_used: entry.tokensUsed,
    cost_usd: entry.costUsd,
  });

  // Logging must never break the user's request.
  if (error) console.error("[db] failed to log usage", error);
}
```

Then in `app/api/improve/route.ts`, replace the `TODO(auth)` comment:

```ts
const result = await improvePrompt(prompt, intent);

await logPromptUsage({
  prompt,
  modelUsed: result.modelUsed,
  intent: result.intent,
  tokensUsed: result.usage?.tokens,
  costUsd: result.usage?.costUsd,
});

return NextResponse.json(result, { ... });
```

Two properties to preserve: the write is awaited but its failure is swallowed and logged, so a database outage degrades to "no logging" rather than a broken site; and `admin` being null keeps every existing test passing with no database.

**Test gate the spec asks for:** a unit test for the persistence function with the client mocked, covering the success path, the write-failure path, and the unconfigured-null path.

## Step 4 — Auth, only if actually wanted

Skip unless history or per-user limits are the goal.

1. `pnpm add @supabase/ssr` — the cookie-based helpers. Do not put sessions in `localStorage`; any XSS reads them.
2. Supabase dashboard → Authentication → enable email/password. Add OAuth providers if wanted.
3. Add `middleware.ts` to refresh the session cookie.
4. Build `/login` and `/signup`.
5. In the API route, read the user server-side and pass `userId` to `logPromptUsage`.
6. Key the rate limiter on `user.id` when present, falling back to IP for anonymous users.

**Non-negotiable:** verify the JWT **server-side in the route handler**, on every request. A client-side route guard hides the UI; it does not protect the endpoint. The spec is explicit that the backend rejects unauthenticated requests.

Keep anonymous use working. Requiring signup to try the tool would undo the thing that makes it useful to the audience it's for.

## Step 5 — Seeing the data

`select model_used, count(*), sum(cost_usd) from prompt_logs group by 1` in the SQL editor answers the cost question. A dashboard page is only worth building once the numbers are interesting.

## Checklist

- [ ] Project created, three keys in `.env.local` **and** Vercel
- [ ] `service_role` key confirmed absent from any client bundle
- [ ] Table created, RLS enabled, no client policy
- [ ] Decision recorded on storing prompt/response text; `/about` matches reality
- [ ] `lib/db.ts` added with the null-client fallback
- [ ] Route handler logs usage; failures swallowed and logged
- [ ] Unit test with mocked client: success, failure, unconfigured
- [ ] `pnpm test && pnpm test:e2e && pnpm build` still green
