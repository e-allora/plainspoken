import type { Metadata } from "next";
import { IBM_Plex_Mono, Karla, Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE, creditLine } from "@/lib/site";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const description =
  "Type what you want in your own words. We rewrite it into a prompt the AI understands, and show you what changed so you learn as you go.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Plainspoken — say it plainly, we'll make it land",
  description,
  openGraph: {
    type: "website",
    siteName: "Plainspoken",
    url: SITE.url,
    title: "Plainspoken — say it plainly, we'll make it land",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Plainspoken — say it plainly, we'll make it land",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${karla.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-desk-deep">
          <nav
            aria-label="Main"
            className="mx-auto flex w-full max-w-5xl items-baseline justify-between gap-6 px-5 py-5"
          >
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-ink"
            >
              Plainspoken
              <span aria-hidden className="ml-1 text-pen">
                .
              </span>
            </Link>
            <div className="flex items-baseline gap-6 text-sm">
              <Link
                href="/learn"
                className="text-ink-soft underline-offset-4 transition-colors hover:text-pen hover:underline"
              >
                Learn
              </Link>
              <Link
                href="/about"
                className="text-ink-soft underline-offset-4 transition-colors hover:text-pen hover:underline"
              >
                About
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-(--spacing-section) bg-blotter text-pad">
          <div className="mx-auto w-full max-w-5xl px-5 py-10">
            <p className="font-display text-lg">
              Plainspoken
              <span aria-hidden className="text-margin">
                .
              </span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-pad/70">
              A free tool for anyone who has ever typed something into an AI and
              got back something useless. No account needed.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/learn" className="text-pad/80 underline-offset-4 hover:underline">
                Learn
              </Link>
              <Link href="/about" className="text-pad/80 underline-offset-4 hover:underline">
                About
              </Link>
              <Link
                href="/about#how-it-works"
                className="text-pad/80 underline-offset-4 hover:underline"
              >
                Privacy and how this site works
              </Link>
              <a
                href={SITE.sourceUrl}
                className="text-pad/80 underline-offset-4 hover:underline"
              >
                Source
              </a>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-pad/80">
              {creditLine()} Rewrites run on Claude Haiku, an AI model made by
              Anthropic, reached through OpenRouter. This site doesn&apos;t store
              your words, and we ask OpenRouter to send them only to providers
              with a zero-data-retention policy. Plainspoken is an independent
              project. It isn&apos;t affiliated with or endorsed by Anthropic,
              OpenAI, Google, or OpenRouter.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
