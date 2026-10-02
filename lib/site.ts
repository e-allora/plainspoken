/**
 * Public identity shown in the footer and on /about.
 * AUTHOR is the credit-line name. Leave it empty to credit no person.
 * Never put a home address, phone number, or personal email here.
 */
export const SITE = {
  author: "Robert Sweetman",
  authorUrl: "", // e.g. a LinkedIn profile. Optional.
  /**
   * A project address people can write to if they can't use GitHub (most of the
   * audience can't). Shown on /about when set. Use an address made for this
   * site, not a personal one. Empty = not shown.
   */
  contactEmail: "" as string,
  url: "https://plainspoken.site",
  tagline: "Say it plainly. We'll make it land.",
  sourceUrl: "https://github.com/e-allora/plainspoken",
} as const;

export function creditLine(): string {
  const who = SITE.author ? `Built by ${SITE.author} with` : "Built with";
  return `${who} Claude Code from Anthropic.`;
}
