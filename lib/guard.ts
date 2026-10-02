/**
 * A last look at what someone typed before it leaves their browser.
 *
 * Why it exists: the lesson "What you type isn't private" says to leave real
 * numbers out, and this site sends every prompt to an AI service. If someone
 * types their Social Security number anyway, the kind thing is to say so
 * before it goes, not after.
 *
 * What it is not: a security boundary. It runs in the browser, it only knows
 * English, it can be wrong in both directions, and the person can always choose
 * to send anyway. The patterns below favor precision, so it stays quiet on
 * ordinary prompts.
 */

export type Concern =
  | { kind: "sensitive"; what: string }
  | { kind: "distress" };

/** US SSN: 3-2-4 digits, excluding the ranges the SSA never issues (000, 666, 9xx; 00; 0000). */
const SSN = /\b(?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/;

/** 13 to 19 digits, optionally grouped by single spaces or dashes. */
const CARD_CANDIDATE = /\b\d(?:[ -]?\d){12,18}\b/g;

/** Luhn checksum. Real card numbers pass it; most other long numbers don't. */
function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = digits.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function hasCardNumber(text: string): boolean {
  for (const match of text.matchAll(CARD_CANDIDATE)) {
    const digits = match[0].replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) return true;
  }
  return false;
}

const SECRET_PATTERNS: readonly RegExp[] = [
  // API keys with a vendor prefix (OpenAI, Anthropic, OpenRouter, Stripe). The
  // digit lookahead keeps hyphenated words like "sk-learn-pipeline-steps" out.
  /\b(?:sk|pk|rk)[-_](?=[A-Za-z_-]*\d)[A-Za-z0-9_-]{20,}/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  // "my password is Summer2024!". The value must contain a digit or symbol, so
  // "the password is required" doesn't trip it.
  /\b(?:password|passcode|passphrase)\s*(?:is|are|=|:)\s*(?=\S*[\d!@#$%^&*_-])\S{4,}/i,
];

/**
 * Phrases that mean someone may be thinking about hurting themselves. Kept to
 * high-precision wording. A false positive costs one click; a miss is why this
 * exists, so it errs toward showing the note.
 */
const DISTRESS = new RegExp(
  `\\b(?:${[
    "kill(?:ing)? myself",
    "end(?:ing)? my (?:own )?life",
    "take my own life",
    "(?:want|wanna|going) to die",
    "(?:don['’]?t|do not) want to (?:live|be alive|be here anymore|exist)",
    "suicid(?:e|al)",
    "(?:hurt|harm)(?:ing)? myself",
    "self[- ]?harm",
    "no reason to (?:live|go on)",
    "better off (?:dead|without me)",
    "can['’]?t go on",
  ].join("|")})\\b`,
  "i",
);

export function findConcerns(text: string): Concern[] {
  const found: Concern[] = [];
  if (SSN.test(text)) found.push({ kind: "sensitive", what: "a Social Security number" });
  if (hasCardNumber(text)) found.push({ kind: "sensitive", what: "a card number" });
  if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) {
    found.push({ kind: "sensitive", what: "a password or access key" });
  }
  if (DISTRESS.test(text)) found.push({ kind: "distress" });
  return found;
}

/** "a card number", "a card number and a password", "a, b, and c". */
export function listWhat(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
