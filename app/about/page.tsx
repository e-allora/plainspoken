import type { Metadata } from "next";
import Link from "next/link";
import { LESSON_COUNT_TITLE } from "@/lib/lessons";
import { RATE_LIMIT_CONFIG } from "@/lib/rate-limit";
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
            just this one. If what you type looks like a card number, a Social
            Security number, or a password, the page checks with you before it
            sends anything.
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

      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="mt-16 scroll-mt-6 border-t border-desk-deep pt-10"
      >
        <h2
          id="how-heading"
          className="font-display text-(length:--text-title) leading-tight font-semibold text-ink"
        >
          How this site works
        </h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          This site asks you to trust it with your words, so here is how it
          works, in plain words, including what isn&apos;t finished.
        </p>

        <h3 className="mt-8 font-body font-bold text-ink">Who runs it</h3>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Robert Sweetman, on his own. No money, sponsors, or investors are
          behind it, and it isn&apos;t affiliated with Anthropic, OpenAI,
          Google, or OpenRouter. No ads, no tracking, no analytics.
        </p>

        <h3 className="mt-8 font-body font-bold text-ink">
          Services it uses, and what each one sees
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">Vercel</strong> hosts the site. It sees
            each visit, including IP addresses, in short-term logs.
          </li>
          <li>
            <strong className="text-ink">This site</strong> uses your IP address,
            in memory only, to cap rewrites at {RATE_LIMIT_CONFIG.MAX_REQUESTS} an
            hour. It isn&apos;t saved.
          </li>
          <li>
            <strong className="text-ink">OpenRouter</strong> passes your words to
            Claude Haiku, an Anthropic model. We ask OpenRouter to use only
            providers with a zero-data-retention policy. That&apos;s a promise
            those companies make; we can ask for it but can&apos;t inspect it.
          </li>
          <li>
            <strong className="text-ink">&ldquo;Open in ChatGPT&rdquo; and
            &ldquo;Open in Claude&rdquo;</strong> put your finished prompt in the
            link, so it goes to that company under its own rules.
          </li>
          <li>
            <strong className="text-ink">GitHub</strong> stores the public code.
          </li>
        </ul>

        <h3 className="mt-8 font-body font-bold text-ink">What we keep</h3>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Nothing. There are no accounts and no database. Your prompt and its
          rewrite aren&apos;t saved, and blanks you fill in stay in your browser.
        </p>

        <h3 className="mt-8 font-body font-bold text-ink">How it was built</h3>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Robert decided what it does and how it treats you. Claude wrote most
          of the code with him in Claude Code, Anthropic&apos;s coding tool,
          over several sessions between July and October 2026. Claude also
          drafted the lessons and most of the page text; the &ldquo;Why I built
          this&rdquo; note below is Robert&apos;s own words, lightly edited. The
          project&apos;s public history credits Claude on each change it helped
          write, so you can check. The code is MIT-licensed. The lessons and
          page writing are free to reuse with credit, under CC BY 4.0.
        </p>
        <p className="mt-3 leading-relaxed text-ink-soft">
          The idea was inspired by{" "}
          <a
            href="https://promptcowboy.ai"
            rel="noopener noreferrer"
            className="text-pen underline underline-offset-4"
          >
            Prompt Cowboy
          </a>
          . Plainspoken&apos;s design and code are its own.
        </p>

        <h3 className="mt-8 font-body font-bold text-ink">
          What isn&apos;t finished
        </h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-ink-soft">
          <li>
            No lawyer, teacher, or other expert has reviewed the lessons yet.
            Lessons that make legal points link their sources so you can check
            them.
          </li>
          <li>
            Rewrites come from an AI and can be wrong. Read yours before you use
            it.
          </li>
          <li>
            The rewriter answers in your language, but the site&apos;s own pages
            are only in English.
          </li>
          <li>
            The hourly cap is counted per server, so it&apos;s looser than it
            sounds.
          </li>
        </ul>

        <h3 className="mt-8 font-body font-bold text-ink">
          Tell us what&apos;s wrong
        </h3>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Mistakes and criticism are welcome, and so are worries about privacy,
          safety, or someone&apos;s work being used without credit.{" "}
          <a
            href={`${SITE.sourceUrl}/issues`}
            className="text-pen underline underline-offset-4"
          >
            Open an issue on GitHub
          </a>
          {SITE.contactEmail ? (
            <>
              {" "}
              or write to{" "}
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="text-pen underline underline-offset-4"
              >
                {SITE.contactEmail}
              </a>
            </>
          ) : null}
          . Say what&apos;s wrong and why it matters, and how to fix it if you
          can. A short note is fine. Every fix is recorded in the project&apos;s
          public history.
        </p>
      </section>

      <p className="mt-12 text-ink-soft">
        Want the short version of the skill itself?{" "}
        <Link href="/learn" className="text-pen underline underline-offset-4">
          {LESSON_COUNT_TITLE} lessons, a few minutes each
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
