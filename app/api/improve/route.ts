import { NextResponse } from "next/server";
import {
  ImproveError,
  improvePrompt,
  validateIntent,
  validatePrompt,
} from "@/lib/improve";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Best-effort client IP. Trusts x-forwarded-for, which is set by Vercel and
 * Cloudflare. Spoofable if the app is ever served without a proxy in front —
 * acceptable while the limiter only guards a modest API budget.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientIp(request));

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `You've used all your free rewrites for now. Try again in about ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} minutes.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "We couldn't read that request." }, { status: 400 });
  }

  const fields = (body ?? {}) as Record<string, unknown>;

  try {
    const prompt = validatePrompt(fields.prompt);
    const intent = validateIntent(fields.intent);
    const result = await improvePrompt(prompt, intent);

    // Decision (2026-10-01): prompts and rewrites are NOT stored. The site
    // promises this in the footer and on /about. The original brief's Supabase
    // logging (docs/2026-07-14-supabase-integration-plan.md) is not to be built
    // as written; any future usage counting must store no text and be disclosed
    // on /about first. See docs/2026-10-01-devils-advocate-review.md.

    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(limit.remaining) },
    });
  } catch (error) {
    if (error instanceof ImproveError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[improve] unexpected error", error);
    return NextResponse.json({ error: "Something went wrong on our end." }, { status: 500 });
  }
}
