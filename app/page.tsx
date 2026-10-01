import Link from "next/link";
import { Improver } from "@/components/improver";
import { LESSONS, LESSON_COUNT, LESSON_COUNT_TITLE } from "@/lib/lessons";

export default function Home() {
  return (
    <>
      {/* Hero: the thesis is the gap between how you talk and what lands. */}
      <section className="mx-auto w-full max-w-5xl px-5 pt-12 pb-(--spacing-section) sm:pt-20">
        <div className="settle max-w-3xl">
          <p className="font-draft text-xs tracking-widest text-pen uppercase">
            Free · No account
          </p>
          <h1 className="mt-4 font-display text-(length:--text-hero) leading-[0.95] font-semibold tracking-tight text-balance text-ink">
            Say it how you&apos;d say it.
            <br />
            <span className="text-ink-soft">We&apos;ll make it land.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Type what you want in your own words. We&apos;ll rewrite it into
            something the AI actually understands — and show you what we changed,
            so next time you can do it yourself.
          </p>
        </div>

        <div className="settle mt-12" style={{ animationDelay: "120ms" }}>
          <Improver />
        </div>
      </section>

      {/* Why it goes wrong — the honest explanation, not a feature list. */}
      <section
        aria-labelledby="why-heading"
        className="border-y border-desk-deep bg-pad/40"
      >
        <div className="mx-auto w-full max-w-5xl px-5 py-(--spacing-section)">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <h2
                id="why-heading"
                className="font-display text-(length:--text-title) leading-tight font-semibold text-balance text-ink"
              >
                It&apos;s not that you&apos;re bad at this.
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                When an AI gives you something vague and useless, it&apos;s
                usually because it was missing something only you knew. It
                doesn&apos;t ask. It guesses, and it guesses wrong.
              </p>
            </div>

            <dl className="grid gap-8 sm:grid-cols-2">
              <div className="border-l-2 border-margin pl-4">
                <dt className="font-body font-bold text-ink">
                  It doesn&apos;t know who you are
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Your job, your situation, who&apos;s reading. So it writes for
                  an average of everybody, which suits nobody.
                </dd>
              </div>
              <div className="border-l-2 border-margin pl-4">
                <dt className="font-body font-bold text-ink">
                  It fills gaps by inventing
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Leave out the date and it&apos;ll make one up. Confidently.
                  That&apos;s where most wasted time comes from.
                </dd>
              </div>
              <div className="border-l-2 border-margin pl-4">
                <dt className="font-body font-bold text-ink">
                  It defaults to essays
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Ask for ideas, get five paragraphs. It never occurred to it
                  that you wanted a list, because you didn&apos;t say.
                </dd>
              </div>
              <div className="border-l-2 border-margin pl-4">
                <dt className="font-body font-bold text-ink">
                  It waits to be told
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  It won&apos;t ask a clarifying question unless you invite one.
                  Silence reads as &ldquo;go ahead and guess&rdquo;.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Learn teaser */}
      <section
        aria-labelledby="learn-heading"
        className="mx-auto w-full max-w-5xl px-5 py-(--spacing-section)"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="learn-heading"
              className="font-display text-(length:--text-title) leading-tight font-semibold text-ink"
            >
              {LESSON_COUNT_TITLE} things worth knowing
            </h2>
            <p className="mt-2 max-w-lg text-ink-soft">
              This tool is a crutch, and we&apos;d rather you didn&apos;t need
              it. Each of these takes about two minutes.
            </p>
          </div>
          <Link
            href="/learn"
            className="text-sm font-medium text-pen underline underline-offset-4 hover:text-pen-deep"
          >
            See all {LESSON_COUNT}
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LESSONS.slice(0, 3).map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/learn/${lesson.slug}`}
                className="pad group flex h-full flex-col rounded-sm p-5 transition-transform hover:-translate-y-0.5"
              >
                <p className="font-display text-xl font-semibold text-ink group-hover:text-pen">
                  {lesson.title}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {lesson.hook}
                </p>
                <p className="mt-4 font-draft text-xs text-ink-faint">
                  {lesson.minutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
