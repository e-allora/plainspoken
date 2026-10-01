"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const resultRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Text typed before the page finished loading sits in the box but not in
  // state, leaving the counter at 0 and the button disabled (slow phones hit
  // this). Pick it up once React takes over.
  useEffect(() => {
    const typedEarly = textareaRef.current?.value;
    if (typedEarly) setPrompt(typedEarly);
  }, []);

  const tooLong = prompt.length > MAX_PROMPT_LENGTH;
  const canSubmit = prompt.trim().length >= 3 && !tooLong && status !== "loading";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

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
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.improvedPrompt);
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
              onChange={(event) => setPrompt(event.target.value)}
              rows={5}
              placeholder="Say it however it comes out. Messy is fine."
              aria-describedby="prompt-help"
              className="on-rules block w-full resize-y border-0 bg-transparent p-0 pl-12 font-draft text-base text-ink placeholder:text-ink-faint/60 focus:outline-none"
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
                    className="rounded-full border border-desk-deep bg-pad/60 px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-pen hover:text-pen"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
              className="mt-1.5 rounded-sm border border-desk-deep bg-pad px-3 py-2 text-sm text-ink"
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
            className="rounded-sm bg-pen px-6 py-3 font-body text-base font-medium text-pad transition-all hover:bg-pen-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Marking it up…" : "Mark up my prompt"}
          </button>
        </div>
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
          <Result result={result} onCopy={handleCopy} copied={copied} />
        )}
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
  onCopy: () => void;
  copied: boolean;
}) {
  const encoded = encodeURIComponent(result.improvedPrompt);

  return (
    <div className="settle mt-(--spacing-section)">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        {/* The clean copy. Serif, because it's finished work. */}
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Your prompt, marked up
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Copy this into ChatGPT, Claude, Gemini — wherever you were headed.
          </p>

          <div className="pad mt-4 rounded-sm p-5">
            <div className="pad-ruled pad-margin">
              <p className="on-rules pl-12 font-display text-lg whitespace-pre-wrap text-ink">
                {result.improvedPrompt}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCopy}
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

          {result.improvedPrompt.includes("[") && (
            <p className="mt-4 border-l-2 border-margin pl-3 text-sm text-ink-soft">
              Anything in [square brackets] is a blank for you to fill in. We
              left those because only you know the answer.
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
