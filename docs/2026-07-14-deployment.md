# Deployment — 14 July 2026

> **Status note, 2026-10-02.** The site is deployed at plainspoken.site, and the
> security headers below are now in `next.config.ts` (HSTS is left to Vercel). The
> Cloudflare section is optional. If the site is ever served through Cloudflare in
> front of Vercel, the per-IP rate limit may see Cloudflare's addresses instead of
> visitors', which would let one busy region use up everyone's allowance. See
> `docs/2026-10-02-ethics-and-risk-audit.md`.

**Status: not deployed.** No Vercel, Cloudflare, or GitHub setting was changed. These are the steps.

---

## Before you deploy

- [ ] `pnpm test && pnpm test:e2e && pnpm build` green
- [ ] `.env.local` is gitignored and contains no committed key
- [ ] Decide the public name (see "Renaming" below) — cheaper before launch than after

## Vercel

The app is at the repository root, so Vercel needs no root-directory override.

1. vercel.com → Add New → Project → import `e-allora/PromptingSite`.
2. Framework preset: Next.js. Everything else default.
3. **Environment variables** — add before the first deploy:

   | Name | Value | Environments |
   |---|---|---|
   | `OPENROUTER_API_KEY` | your key | Production, Preview, Development |
   | `SITE_URL` | `https://your-domain.com` | Production |

   `OPENROUTER_API_KEY` has no `NEXT_PUBLIC_` prefix and must never get one — that would ship your key to every visitor's browser.
4. Deploy. Push to `main` deploys production; every other branch gets a preview URL.

### Rate limiting caveat

`lib/rate-limit.ts` holds counters in memory. Vercel runs multiple instances, so each keeps its own — the real limit is looser than 15/hour/IP. Adequate at launch, since the worst case is bounded by your OpenRouter spend cap. Move to Upstash Redis if that stops being comfortable.

### Spending cap

Set one at openrouter.ai before the site is public. It is the only hard backstop; the rate limiter is a speed bump. The account currently has a $30/week limit, which at ~$0.002 per rewrite is roughly 15,000 rewrites — but a cap you set deliberately beats one you discovered by accident.

## Cloudflare

Only needed if you want your own domain, caching, and WAF in front. Vercel alone works fine.

1. Add your domain to Cloudflare; point the registrar at their nameservers.
2. Vercel → Project → Settings → Domains → add the domain. Vercel shows the DNS record it wants.
3. In Cloudflare DNS, add that record with the **proxy on** (orange cloud).
4. SSL/TLS mode: **Full (strict)**. Anything less allows an unencrypted hop.
5. Caching: static assets cache themselves via Next's hashed filenames. **Do not cache `/api/*`** — a cached rewrite would serve one person's result to another. Cloudflare doesn't cache POST by default; don't add a rule that changes that.

Set `SITE_URL` in Vercel to the final domain once live.

## Security headers

Not yet configured. Add to `next.config.ts` when convenient:

```ts
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  }];
}
```

A Content-Security-Policy is worth adding too, but needs a per-request nonce to work with Next's inline hydration scripts — do it as its own task rather than pasting a policy that breaks the site.

## Renaming

"Plainspoken" is a placeholder chosen so the writing could have a consistent voice. It appears in:

- `app/layout.tsx` — header wordmark, footer, `metadata.title`
- `app/about/page.tsx`, `app/learn/page.tsx`, `app/learn/[slug]/page.tsx` — page titles
- `lib/improve.ts` — the `X-Title` header sent to OpenRouter

Grep for `Plainspoken`. Nothing depends on it structurally.

## After deploying

- [ ] Run one real rewrite on the live URL
- [ ] Check an error path — a wrong `OPENROUTER_API_KEY` in Preview should show a plain sentence, not a stack trace
- [ ] Confirm no key appears in the browser: DevTools → Sources → search your key prefix
- [ ] Confirm the OpenRouter spending cap is set
