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
});
