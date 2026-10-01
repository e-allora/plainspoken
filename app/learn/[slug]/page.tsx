import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS, LESSON_COUNT, getLesson } from "@/lib/lessons";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Not found — Plainspoken" };

  return {
    title: `${lesson.title} — Plainspoken`,
    description: lesson.hook,
  };
}

export default async function LessonPage({ params }: Params) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const index = LESSONS.findIndex((item) => item.slug === slug);
  const next = LESSONS[index + 1];

  return (
    <article className="mx-auto w-full max-w-3xl px-5 pt-12 pb-(--spacing-section) sm:pt-16">
      <Link
        href="/learn"
        className="font-draft text-xs tracking-widest text-ink-faint uppercase hover:text-pen"
      >
        ← All lessons
      </Link>

      <h1 className="mt-6 font-display text-(length:--text-title) leading-tight font-semibold tracking-tight text-balance text-ink">
        {lesson.title}
      </h1>
      <p className="mt-3 font-draft text-xs text-ink-faint">
        {lesson.minutes} min read
      </p>

      <div className="mt-8 space-y-5">
        {lesson.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed text-ink-soft">
            {paragraph}
          </p>
        ))}
      </div>

      {/* The before/after is the lesson. Draft type vs. finished type. */}
      <section aria-label="Example" className="mt-12">
        <div className="pad rounded-sm p-5 sm:p-6">
          <p className="font-draft text-xs tracking-widest text-ink-faint uppercase">
            Instead of
          </p>
          <p className="mt-2 font-draft text-base leading-relaxed whitespace-pre-wrap text-ink-soft line-through decoration-pen/60 decoration-1">
            {lesson.before}
          </p>

          <hr className="my-5 border-0 border-t border-pad-edge" />

          <p className="font-draft text-xs tracking-widest text-pen uppercase">
            Try
          </p>
          <div className="pad-ruled mt-3">
            <p className="on-rules font-display text-lg whitespace-pre-wrap text-ink">
              {lesson.after}
            </p>
          </div>
        </div>

        <p className="mt-5 border-l-2 border-pen bg-pen-wash px-4 py-3 leading-relaxed text-ink">
          {lesson.point}
        </p>
      </section>

      {lesson.sources && lesson.sources.length > 0 && (
        <section aria-labelledby="sources-heading" className="mt-10">
          <h2
            id="sources-heading"
            className="font-draft text-xs tracking-widest text-ink-faint uppercase"
          >
            Sources
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {lesson.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  rel="noopener noreferrer"
                  className="text-pen underline underline-offset-4 hover:text-pen-deep"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav
        aria-label="Lesson navigation"
        className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-desk-deep pt-6"
      >
        {next ? (
          <Link href={`/learn/${next.slug}`} className="group">
            <span className="font-draft text-xs tracking-widest text-ink-faint uppercase">
              Next
            </span>
            <span className="mt-1 block font-display text-xl font-semibold text-ink group-hover:text-pen">
              {next.title}
            </span>
          </Link>
        ) : (
          <p className="text-ink-soft">
            That&apos;s all {LESSON_COUNT}. The rest is practice.
          </p>
        )}

        <Link
          href="/"
          className="rounded-sm bg-pen px-5 py-2.5 text-sm font-medium text-pad hover:bg-pen-deep"
        >
          Try it on your own prompt
        </Link>
      </nav>
    </article>
  );
}
