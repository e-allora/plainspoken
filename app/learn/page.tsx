import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS, LESSON_COUNT, LESSON_COUNT_TITLE } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Learn — Plainspoken",
  description:
    `${LESSON_COUNT_TITLE} short, plain-language lessons on getting useful answers out of AI. No jargon, a few minutes each.`,
};

export default function LearnIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-(--spacing-section) sm:pt-16">
      <h1 className="font-display text-(length:--text-hero) leading-[0.95] font-semibold tracking-tight text-balance text-ink">
        {LESSON_COUNT_TITLE} things worth knowing
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
        There&apos;s no secret vocabulary and no magic words. It&apos;s mostly
        just saying more of what&apos;s already in your head. These are the {LESSON_COUNT}
        moves that do the most work.
      </p>

      <ol className="mt-12 space-y-3">
        {LESSONS.map((lesson, index) => (
          <li key={lesson.slug}>
            <Link
              href={`/learn/${lesson.slug}`}
              className="group flex items-baseline gap-4 border-b border-desk-deep py-5 transition-colors hover:border-pen"
            >
              <span
                aria-hidden
                className="font-draft text-sm text-ink-faint transition-colors group-hover:text-pen"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block font-display text-xl font-semibold text-ink group-hover:text-pen">
                  {lesson.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                  {lesson.hook}
                </span>
              </span>
              <span className="font-draft text-xs whitespace-nowrap text-ink-faint">
                {lesson.minutes} min
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-ink-soft">
        Want a shortcut while you learn?{" "}
        <Link href="/" className="text-pen underline underline-offset-4">
          Run a prompt through the tool
        </Link>{" "}
        and read the notes in the margin.
      </p>
    </div>
  );
}
