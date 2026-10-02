import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Reads the real colour tokens from app/globals.css and checks the pairs the
 * site actually uses against WCAG 2.2 AA: 4.5:1 for text, 3:1 for the border
 * that tells you a control is a control.
 *
 * Why it's a test: the original palette had small grey text at 2.9-3.2:1 and
 * red link text at 4.0:1, which people with low vision (and anyone in sunlight
 * on a phone) can't read. If this fails after a design change, fix the colour,
 * not the test.
 */

const css = fs.readFileSync(path.join(import.meta.dirname, "../app/globals.css"), "utf8");
const token = (name: string): RGB => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token --color-${name} not found in globals.css`);
  return hex(match[1]);
};

type RGB = [number, number, number];

function hex(value: string): RGB {
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;
}

/** Colour `fg` at opacity `alpha` painted over `bg`. */
function over(fg: RGB, bg: RGB, alpha: number): RGB {
  return fg.map((channel, i) => channel * alpha + bg[i] * (1 - alpha)) as RGB;
}

function luminance([r, g, b]: RGB): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const desk = token("desk");
const pad = token("pad");
const penWash = token("pen-wash");
const blotter = token("blotter");
/** The "why it goes wrong" band is the pad at 40% over the desk. */
const band = over(pad, desk, 0.4);
/** The example chips are the pad at 60% over the desk. */
const chip = over(pad, desk, 0.6);

const textPairs: Array<[string, RGB, RGB]> = [
  ["ink on desk", token("ink"), desk],
  ["ink on pad", token("ink"), pad],
  ["ink-soft on desk", token("ink-soft"), desk],
  ["ink-soft on pad", token("ink-soft"), pad],
  ["ink-soft on the band", token("ink-soft"), band],
  ["ink-soft on a chip", token("ink-soft"), chip],
  ["ink-faint on desk (lesson back-link, sources)", token("ink-faint"), desk],
  ["ink-faint on pad (box label, counter, read time, placeholder)", token("ink-faint"), pad],
  ["ink-faint on the band", token("ink-faint"), band],
  ["pen on desk (links, eyebrow labels)", token("pen"), desk],
  ["pen on pad (links)", token("pen"), pad],
  ["pen on pen-wash", token("pen"), penWash],
  ["pen-deep on pen-wash (fill-in blank labels)", token("pen-deep"), penWash],
  ["pad on pen (primary button)", pad, token("pen")],
  ["pad on pen-deep (button hover)", pad, token("pen-deep")],
  ["pad on ink (secondary button)", pad, token("ink")],
  ["footer text (pad at 80%) on blotter", over(pad, blotter, 0.8), blotter],
  ["footer wordmark (pad) on blotter", pad, blotter],
];

describe("text contrast (WCAG 2.2 AA, 4.5:1)", () => {
  it.each(textPairs)("%s", (_label, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("control borders (WCAG 2.2 AA non-text, 3:1)", () => {
  it("the select and example chips are outlined in ink-faint, visible against the pad", () => {
    expect(ratio(token("ink-faint"), pad)).toBeGreaterThanOrEqual(3);
    expect(ratio(token("ink-faint"), chip)).toBeGreaterThanOrEqual(3);
  });

  it("the focus ring (pen) shows against every surface it lands on", () => {
    for (const surface of [desk, pad, penWash, band]) {
      expect(ratio(token("pen"), surface)).toBeGreaterThanOrEqual(3);
    }
  });
});
