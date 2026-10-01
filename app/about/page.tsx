import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Plainspoken",
  description:
    "What Plainspoken is, who it's for, what it does with your words, and what it costs.",
};

export default function About() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-(--spacing-section) sm:pt-16">
      <h1 className="font-display text-(length:--text-hero) leading-[0.95] font-semibold tracking-tight text-balance text-ink">
        About
      </h1>

      <div className="mt-8 space-y-5">
        <p className="text-lg leading-relaxed text-ink-soft">
          Plainspoken takes the rough sentence you were going to type into an AI
          and rewrites it into one that works. Then it tells you what it changed
          and why, because the goal is that you stop needing it.
        </p>
        <p className="text-lg leading-relaxed text-ink-soft">
          It&apos;s built for people who keep being told this technology will
          change everything, and who have so far found it mostly annoying.
          That&apos;s not a you problem. Nobody was handed the instructions.
        </p>
      </div>

      <dl className="mt-12 space-y-8">
        <div className="border-l-2 border-margin pl-4">
          <dt className="font-display text-xl font-semibold text-ink">
            What happens to what I type?
          </dt>
          <dd className="mt-2 leading-relaxed text-ink-soft">
            It&apos;s sent to an AI model to be rewritten, and the result comes
            back to you. This site doesn&apos;t save it. We also ask the service
            in between, OpenRouter, to use only providers that have a
            zero-data-retention policy — that&apos;s a promise those companies
            make, which we can ask for but can&apos;t inspect. There are no
            accounts, so nothing is tied to your name. Even so — don&apos;t
            paste in passwords, card numbers, or anything you&apos;d mind a
            stranger reading. That&apos;s good practice with any AI tool, not
            just this one.
          </dd>
        </div>

        <div className="border-l-2 border-margin pl-4">
          <dt className="font-display text-xl font-semibold text-ink">
            Does it cost anything?
          </dt>
          <dd className="mt-2 leading-relaxed text-ink-soft">
            No. There&apos;s a cap on how many rewrites one person can run in an
            hour, which keeps the bill survivable. If you hit it, wait a bit.
          </dd>
        </div>

        <div className="border-l-2 border-margin pl-4">
          <dt className="font-display text-xl font-semibold text-ink">
            Will it write the thing for me?
          </dt>
          <dd className="mt-2 leading-relaxed text-ink-soft">
            No, and that&apos;s deliberate. It writes the <em>instruction</em>.
            You take that to ChatGPT, Claude, Gemini, or whatever you already
            use, and that tool does the work. This is the bit that goes before.
          </dd>
        </div>

        <div className="border-l-2 border-margin pl-4">
          <dt className="font-display text-xl font-semibold text-ink">
            Can I trust what the AI tells me afterwards?
          </dt>
          <dd className="mt-2 leading-relaxed text-ink-soft">
            Not blindly. A better prompt gets you a better answer, not a
            guaranteed true one. These tools state wrong things with total
            confidence. For anything that matters — medical, legal, money —
            check it against a real source or a real person.
          </dd>
        </div>

        <div className="border-l-2 border-margin pl-4">
          <dt className="font-display text-xl font-semibold text-ink">
            Who made this?
          </dt>
          <dd className="mt-2 leading-relaxed text-ink-soft">
            {SITE.author ? (
              <>
                {SITE.authorUrl ? (
                  <a href={SITE.authorUrl} className="text-pen underline underline-offset-4">
                    {SITE.author}
                  </a>
                ) : (
                  SITE.author
                )}{" "}
                built it,
              </>
            ) : (
              "It was built"
            )}{" "}
            working with Claude Code, an AI coding tool from Anthropic. The
            person decided what it should do and how it should treat you; the
            AI wrote most of the code. The rewrites themselves come from Claude
            Haiku, an AI model made by Anthropic, reached through a service
            called OpenRouter. The code is public at{" "}
            <a href={SITE.sourceUrl} className="text-pen underline underline-offset-4">
              GitHub
            </a>
            , so you can check any of this.
          </dd>
        </div>
      </dl>

      <p className="mt-12 text-ink-soft">
        Want the short version of the skill itself?{" "}
        <Link href="/learn" className="text-pen underline underline-offset-4">
          Six lessons, two minutes each
        </Link>
        .
      </p>

      <section
        aria-labelledby="why-heading"
        className="mt-16 border-t border-desk-deep pt-10"
      >
        <h2
          id="why-heading"
          className="font-display text-(length:--text-title) leading-tight font-semibold text-ink"
        >
          Why I built this
        </h2>
        <div className="mt-5 space-y-5">
          <p className="text-lg leading-relaxed text-ink-soft">
            Over the past few years I noticed most prompting sites were built for
            developers. But the people I talked to about AI who weren&apos;t in
            tech were mostly intimidated by it — unsure how to make it work for
            what they actually needed.
          </p>
          <p className="text-lg leading-relaxed text-ink-soft">
            AI has improved my quality of life. I built this to help others get
            there too: openly, for free, and with nothing asked in return. I
            wanted to take some of the mystery out of it — and, if it&apos;s
            possible, teach you enough that you won&apos;t need this site.
          </p>
        </div>
        <p className="mt-6 text-ink-soft">
          — Robert Sweetman ·{" "}
          <a href={SITE.sourceUrl} className="text-pen underline underline-offset-4">
            The code is open on GitHub
          </a>
          .
        </p>
        <p className="mt-8 text-ink-soft">
          Thank you to my parents, Joanne and Robert Sweetman Sr.{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>
        </p>
      </section>
    </div>
  );
}
