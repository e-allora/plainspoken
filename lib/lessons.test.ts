import { describe, expect, it } from "vitest";
import { LESSONS, LESSON_COUNT } from "./lessons";

describe("LESSONS", () => {
  it("has unique slugs", () => {
    const slugs = LESSONS.map((lesson) => lesson.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("doesn't reuse the retired slug, which now redirects", () => {
    expect(LESSONS.some((lesson) => lesson.slug === "tell-it-who-to-be")).toBe(false);
  });

  it("links every source over https", () => {
    for (const lesson of LESSONS) {
      for (const source of lesson.sources ?? []) {
        expect(source.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("spells the count as a word for page copy", () => {
    expect(LESSON_COUNT).toBe("nine");
  });

  it("says when the facts and sources were last checked, for every lesson that cites sources", () => {
    for (const lesson of LESSONS) {
      if (lesson.sources?.length) {
        expect(lesson.checked, `${lesson.slug} cites sources but has no "checked" date`).toMatch(
          /^[A-Z][a-z]+ \d{4}$/,
        );
      }
    }
  });
});

/**
 * These lessons make claims about real events and a real company. The audit
 * (docs/2026-10-02-ethics-and-risk-audit.md) checked each against its sources,
 * and found wording that misdescribed what happened. These keep the corrected
 * facts from drifting back.
 */
describe("claims about real events", () => {
  const lesson = (slug: string) => {
    const found = LESSONS.find((item) => item.slug === slug);
    if (!found) throw new Error(`no lesson ${slug}`);
    return found;
  };

  it("describes the Heppner ruling as it happened: a seizure, not a handover by the AI company", () => {
    const text = lesson("what-you-type-isnt-private").body.join(" ");
    // The FBI took the chats from his devices with a search warrant. Saying
    // prosecutors were "allowed to obtain" them reads as the AI company having
    // handed them over, which is not what happened.
    expect(text).toContain("search warrant");
    expect(text).not.toMatch(/allowed to obtain/);
    // The court relied on the *consumer* privacy policy.
    expect(text).toContain("consumer version");
  });

  it("describes the Mata v. Avianca fine as joint, and cites the court's own docket", () => {
    const mata = lesson("make-it-say-when-its-guessing");
    expect(mata.body.join(" ")).toContain("and their law firm were fined $5,000");
    expect(mata.sources?.some((source) => source.url.includes("courtlistener.com"))).toBe(true);
  });

  it("doesn't use a real business's name in an example complaint", () => {
    // "Brightway Furniture" is the name of several real companies.
    const example = lesson("give-it-the-facts").after;
    expect(example).not.toMatch(/Brightway/);
    expect(example).toContain("Example Furniture Co.");
  });

  it("points from the lesson that says to add names and numbers to the privacy lesson, by its real title", () => {
    const facts = lesson("give-it-the-facts");
    const privacy = lesson("what-you-type-isnt-private");
    expect(facts.body.join(" ")).toContain(`"${privacy.title}"`);
  });

  it("says plainly that the privacy lesson applies to this site too", () => {
    expect(lesson("what-you-type-isnt-private").body.join(" ")).toContain("That includes this site");
  });
});
