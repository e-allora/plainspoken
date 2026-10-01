import { describe, expect, it } from "vitest";
import { countBlanks, fillBlanks, splitBlanks } from "./blanks";

describe("splitBlanks", () => {
  it("finds plain-language blanks", () => {
    const segments = splitBlanks("I live in [your city] and pay [monthly rent].");
    expect(countBlanks(segments)).toBe(2);
    expect(segments[1]).toEqual({ blank: "your city", index: 0 });
    expect(segments[3]).toEqual({ blank: "monthly rent", index: 1 });
  });

  it("leaves code-style brackets alone", () => {
    for (const code of ["return arr[0]", "use list[index] here", "matrix[i][j]", "pick [10] items"]) {
      expect(countBlanks(splitBlanks(code))).toBe(0);
    }
  });

  it("returns the whole prompt as one segment when there are no blanks", () => {
    expect(splitBlanks("no blanks here")).toEqual([{ text: "no blanks here" }]);
  });
});

describe("fillBlanks", () => {
  const segments = splitBlanks("Write to [landlord name] about the heat since [date].");

  it("puts typed values in place of blanks", () => {
    expect(fillBlanks(segments, { 0: "Mr. Lee", 1: "Monday" })).toBe(
      "Write to Mr. Lee about the heat since Monday.",
    );
  });

  it("keeps unfilled or blank-only values as visible brackets", () => {
    expect(fillBlanks(segments, { 0: "   " })).toBe(
      "Write to [landlord name] about the heat since [date].",
    );
  });

  it("round-trips the original text when nothing is filled", () => {
    const original = "Use [my name], keep arr[0] as is.";
    expect(fillBlanks(splitBlanks(original), {})).toBe(original);
  });
});
