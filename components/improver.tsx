"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { countBlanks, fillBlanks, splitBlanks } from "@/lib/blanks";
import { findConcerns, listWhat, type Concern } from "@/lib/guard";
import type { Improvement, ImproveResult } from "@/lib/improve";
import { MAX_PROMPT_LENGTH } from "@/lib/improve";

const CATEGORIES = [
  { value: "auto", label: "Figure it out for me" },
  { value: "write", label: "Writing something" },
  { value: "analyze", label: "Understanding something" },
  { value: "code", label: "Code or tech" },
  { value: "image", label: "A picture" },
  { value: "general", label: "Something else" },
] as const;

const EXAMPLES = [
  "help me write an email to my landlord about my broken heater",
  "explain what a 401k is",
  "ideas for my daughter's 8th birthday party",
  "make my resume better",
];

type Status = "idle" | "loading" | "done" | "error";

export function Improver() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  // What lib/guard.ts found before sending, and the exact text the person chose
  // to send anyway (so editing it brings the check back).
  const [held, setHeld] = useState<Concern[]>([]);
  const [okToSend, setOkToSend] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const heldRef = useRef<HTMLElement>(null);

  // Text typed before the page finished loading sits in the box but not in
  // state, leaving the counter at 0 and the button disabled (slow phones hit
  // this). Pick it up once React takes over.
  useEffect(() => {
    const typedEarly = textareaRef.current?.value;
    if (typedEarly) setPrompt(typedEarly);
  }, []);

  // Move focus to the pause notice so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (held.length > 0) heldRef.current?.focus();
  }, [held]);

  const tooLong = prompt.length > MAX_PROMPT_LENGTH;
  const canSubmit = prompt.trim().length >= 3 && !tooLong && status !== "loading";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    // A courtesy pause for what shouldn't go to a third party. Not a gate: the
    // person can always send anyway.
    if (okToSend !== prompt) {
      const concerns = findConcerns(prompt);
      if (concerns.length > 0) {
        setHeld(concerns);
        return;
      }
    }

    await send();
  }

  function sendAnyway() {
    setOkToSend(prompt);
    setHeld([]);
    void send();
  }

  function editInstead() {
    setHeld([]);
    textareaRef.current?.focus();
  }

  async function send() {
    setStatus("loading");
    setError("");
    setCopied(false);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, intent: category }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setResult(data as ImproveResult);
      setStatus("done");
      // A script-requested smooth scroll ignores the CSS reduced-motion rule, so
      // ask the browser directly.
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        }),
      );
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Your browser blocked copying. Select the text and copy it manually.");
    }
  }

  return (
    <section aria-labelledby="improver-heading">
      <h2 id="improver-heading" className="sr-only">
        Improve your prompt
      </h2>

      <form onSubmit={handleSubmit}>
        {/* The pad: where the rough draft goes. Monospace, because it's a draft. */}
        <div className="pad rounded-sm p-4 sm:p-5">
          <label
            htmlFor="prompt"
            className="block font-draft text-xs tracking-wide text-ink-faint uppercase"
          >
            What do you want the AI to do?
          </label>

          <div className="pad-ruled pad-margin mt-3">
            <textarea
              ref={textareaRef}
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                if (held.length > 0) setHeld([]);
              }}
              rows={5}
              placeholder="Say it however it comes out. Messy is fine."
              aria-describedby="prompt-help"
              className="on-rules block w-full resize-y border-0 bg-transparent p-0 pl-12 font-draft text-base text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
            <p id="prompt-help" className="text-xs text-ink-soft">
              Plain words work best. No special phrasing needed.
            </p>
            <p
              className={`font-draft text-xs tabular-nums ${
                tooLong ? "font-medium text-pen" : "text-ink-faint"
              }`}
            >
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </p>
          </div>
        </div>

        {/* Examples: an invitation to act, for the empty state. */}
        {prompt.length === 0 && (
          <div className="mt-4">
            <p className="text-xs text-ink-soft">Or start with one of these:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    onClick={() => setPrompt(example)}
                    className="rounded-full border border-ink-faint bg-pad/60 px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-pen hover:text-pen"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The point is to stop needing this tool. Free to run: no API call. */}
        <details className="mt-5 text-sm text-ink-soft">
          <summary className="cursor-pointer font-medium text-ink hover:text-pen">
            Try it yourself first
          </summary>
          <p className="mt-2">
            Check your words against three questions. Most of what we&apos;d
            fix comes from these:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              <Link href="/learn/say-who-it-is-for" className="text-pen underline underline-offset-4">
                Who is it for?
              </Link>
            </li>
            <li>
              <Link href="/learn/say-what-you-want-back" className="text-pen underline underline-offset-4">
                What do you want back?
              </Link>{" "}
              A list, an email, three options?
            </li>
            <li>
              <Link href="/learn/give-it-the-facts" className="text-pen underline underline-offset-4">
                What do you know that it doesn&apos;t?
              </Link>{" "}
              Dates, names, what you&apos;ve already tried.
            </li>
          </ol>
          <p className="mt-2">
            If your words already answer all three, you may not need us. Copy
            them and go.
          </p>
        </details>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-xs tracking-wide text-ink-soft uppercase"
            >
              What kind of thing is this?
            </label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 rounded-sm border border-ink-faint bg-pad px-3 py-2 text-sm text-ink"
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-describedby="send-note"
            className="rounded-sm bg-pen px-6 py-3 font-body text-base font-medium text-pad transition-all hover:bg-pen-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Marking it up…" : "Mark up my prompt"}
          </button>
        </div>

        {/* Said at the moment of sending, not only in the footer and on /about. */}
        <p id="send-note" className="mt-4 max-w-prose text-sm leading-relaxed text-ink-soft">
          Your words are sent to an AI service to be rewritten. This site
          doesn&apos;t keep them, and we ask the service not to either. Leave
          out passwords, card and ID numbers, and other people&apos;s private
          details.{" "}
          <Link href="/about#how-it-works" className="text-pen underline underline-offset-4">
            What happens to your words
          </Link>
        </p>

        {held.length > 0 && (
          <HeldNotice concerns={held} panelRef={heldRef} onEdit={editInstead} onSend={sendAnyway} />
        )}
      </form>

      <div ref={resultRef} className="scroll-mt-6">
        {status === "loading" && <LoadingNote />}

        {status === "error" && (
          <p
            role="alert"
            className="mt-8 border-l-2 border-pen bg-pen-wash px-4 py-3 text-sm text-ink"
          >
            {error}
          </p>
        )}

        {status === "done" && result && (
          <Result
            key={result.requestId ?? result.improvedPrompt}
            result={result}
            onCopy={handleCopy}
            copied={copied}
          />
        )}
      </div>
    </section>
  );
}

/**
 * Shown instead of sending when lib/guard.ts finds something worth a second
 * thought. Two kinds: a number or secret that shouldn't go to a third party, and
 * wording that may mean the person is struggling. Both end the same way: edit,
 * or continue. Nothing here is stored or sent anywhere.
 */
function HeldNotice({
  concerns,
  panelRef,
  onEdit,
  onSend,
}: {
  concerns: Concern[];
  panelRef: React.RefObject<HTMLElement | null>;
  onEdit: () => void;
  onSend: () => void;
}) {
  const distress = concerns.some((concern) => concern.kind === "distress");
  const sensitive = concerns.flatMap((concern) => (concern.kind === "sensitive" ? [concern.what] : []));
  const link = "text-pen underline underline-offset-4 hover:text-pen-deep";

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      aria-labelledby="held-heading"
      className={`mt-6 border-l-2 px-4 py-4 text-sm leading-relaxed text-ink ${
        distress ? "border-margin bg-pad" : "border-pen bg-pen-wash"
      }`}
    >
      <h3 id="held-heading" className="font-display text-xl font-semibold text-ink">
        {distress
          ? "A quick pause before this goes anywhere"
          : `That looks like it includes ${listWhat(sensitive)}.`}
      </h3>

      {distress && (
        <>
          <p className="mt-2">
            Some of what you wrote sounds like it might be about hurting
            yourself. If that&apos;s true for you, you don&apos;t have to deal
            with it alone.
          </p>
          <p className="mt-2">
            In the US, you can{" "}
            <a href="tel:988" className={link}>
              call or text 988
            </a>{" "}
            (the Suicide &amp; Crisis Lifeline) any time, free. Elsewhere,{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={link}>
              findahelpline.com
            </a>{" "}
            lists free, confidential lines by country. In an emergency, call
            your local emergency number.
          </p>
          <p className="mt-2">
            Plainspoken only rewrites prompts for AI assistants, so it
            can&apos;t help with this part. If that&apos;s not what this is,
            carry on.
          </p>
        </>
      )}

      {sensitive.length > 0 && (
        <p className="mt-2">
          {distress ? `It also looks like this includes ${listWhat(sensitive)}. ` : ""}
          Everything you type here is sent to an AI service, and a real number
          doesn&apos;t make the rewrite any better. Swap it for a placeholder
          like [account number] and try again, or send it as it is.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-pad transition-colors hover:bg-ink-soft"
        >
          Edit what I wrote
        </button>
        <button
          type="button"
          onClick={onSend}
          className="rounded-sm border border-ink-soft px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-pen hover:text-pen"
        >
          {distress ? "Continue with the rewrite" : "Send it anyway"}
        </button>
      </div>
    </section>
  );
}

function LoadingNote() {
  return (
    <p className="mt-8 font-draft text-sm text-ink-soft" role="status">
      Reading it over
      <span className="animate-pulse">…</span>
    </p>
  );
}

function Result({
  result,
  onCopy,
  copied,
}: {
  result: ImproveResult;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const segments = useMemo(() => splitBlanks(result.improvedPrompt), [result.improvedPrompt]);
  const [values, setValues] = useState<Record<number, string>>({});
  const finalPrompt = fillBlanks(segments, values);
  const blanks = countBlanks(segments);
  const unfilled = segments.filter(
    (segment) => "blank" in segment && !values[segment.index]?.trim(),
  ).length;
  const encoded = encodeURIComponent(finalPrompt);

  // Tell screen-reader users the result has arrived (the box they were in is
  // still on screen), without scrolling again: the container already did.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="settle mt-(--spacing-section)">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        {/* The clean copy. Serif, because it's finished work. */}
        <div>
          <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold text-ink">
            Your prompt, marked up
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Copy this into ChatGPT, Claude, Gemini — wherever you were headed.
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            An AI wrote this rewrite, and it can get things wrong. Read it
            through before you use it.
          </p>

          <div className="pad mt-4 rounded-sm p-5">
            <div className="pad-ruled pad-margin">
              <p className="on-rules pl-12 font-display text-lg whitespace-pre-wrap text-ink">
                {segments.map((segment, i) =>
                  "text" in segment ? (
                    <Fragment key={i}>{segment.text}</Fragment>
                  ) : (
                    <input
                      key={i}
                      type="text"
                      aria-label={`Fill in: ${segment.blank}`}
                      placeholder={segment.blank}
                      value={values[segment.index] ?? ""}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [segment.index]: event.target.value,
                        }))
                      }
                      size={Math.max(segment.blank.length, (values[segment.index] ?? "").length, 4)}
                      className="mx-0.5 inline-block max-w-full rounded-sm border-0 border-b-2 border-pen bg-pen-wash px-1 py-0 font-display text-lg text-ink placeholder:text-pen-deep focus:bg-pad focus:outline-none"
                    />
                  ),
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onCopy(finalPrompt)}
              className="rounded-sm bg-ink px-4 py-2.5 text-sm font-medium text-pad transition-colors hover:bg-ink-soft"
            >
              {copied ? "Copied" : "Copy prompt"}
            </button>
            <a
              href={`https://chatgpt.com/?q=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-soft underline underline-offset-4 hover:text-pen"
            >
              Open in ChatGPT
            </a>
            <a
              href={`https://claude.ai/new?q=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink-soft underline underline-offset-4 hover:text-pen"
            >
              Open in Claude
            </a>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            “Open in” puts this prompt in the link, so that company receives it
            under its own rules.
          </p>

          {blanks > 0 && (
            <p className="mt-4 border-l-2 border-margin pl-3 text-sm text-ink-soft">
              The highlighted blanks are for you to fill in — only you know the
              answer. What you type there stays in your browser and goes into
              the copied prompt, not to us.{" "}
              <span aria-live="polite">
                {unfilled > 0 ? `${unfilled} left to fill.` : "All filled in."}
              </span>
            </p>
          )}
        </div>

        {/* The margin: numbered notes in the editor's pen. The teaching. */}
        <Margin improvements={result.improvements} />
      </div>
    </div>
  );
}

function Margin({ improvements }: { improvements: Improvement[] }) {
  if (improvements.length === 0) return null;

  return (
    <aside aria-labelledby="margin-heading" className="lg:pt-1">
      <h3
        id="margin-heading"
        className="font-draft text-xs tracking-widest text-pen uppercase"
      >
        What changed &amp; why
      </h3>

      <ol className="mt-4 space-y-5">
        {improvements.map((improvement, index) => (
          <li key={improvement.label} className="flex gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-pen font-draft text-xs text-pen"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-body text-sm font-bold text-ink">
                {improvement.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {improvement.why}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 border-t border-desk-deep pt-4 text-xs text-ink-faint">
        Learn these moves once and you won&apos;t need this tool.{" "}
        <Link href="/learn" className="text-pen underline underline-offset-4">
          Start here
        </Link>
      </p>
    </aside>
  );
}
