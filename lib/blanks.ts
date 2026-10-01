/**
 * The rewriter leaves "[your city]"-style blanks for details only the user
 * knows. These helpers split a prompt into text and blanks so the page can show
 * a fill-in box for each, and rebuild the prompt with whatever was typed.
 * Everything here runs in the browser; filled values never reach the server.
 */

export type Segment = { text: string } | { blank: string; index: number };

/**
 * A blank is [2–60 characters with at least one letter], not preceded by a word
 * character or "]", so code like arr[0] or list[index] is left alone.
 */
const BLANK = /(?<![\w\]])\[([^[\]\n]{2,60})\]/g;

export function splitBlanks(prompt: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  let index = 0;

  for (const match of prompt.matchAll(BLANK)) {
    if (!/[a-z]/i.test(match[1])) continue; // [10] or [1-2]: not a blank
    segments.push({ text: prompt.slice(last, match.index) });
    segments.push({ blank: match[1], index: index++ });
    last = match.index + match[0].length;
  }

  segments.push({ text: prompt.slice(last) });
  return segments;
}

/** Rebuild the prompt; an unfilled blank stays as "[blank]" so it's still visible. */
export function fillBlanks(segments: Segment[], values: Record<number, string>): string {
  return segments
    .map((segment) =>
      "text" in segment ? segment.text : values[segment.index]?.trim() || `[${segment.blank}]`,
    )
    .join("");
}

export function countBlanks(segments: Segment[]): number {
  return segments.filter((segment) => "blank" in segment).length;
}
