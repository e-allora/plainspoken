import { describe, expect, it } from "vitest";
import { findConcerns, listWhat } from "./guard";

const whats = (text: string) =>
  findConcerns(text).map((concern) => (concern.kind === "sensitive" ? concern.what : "distress"));

describe("findConcerns: stays quiet on ordinary prompts", () => {
  const ordinary = [
    "help me write an email to my landlord about my broken heater",
    "explain what a 401k is",
    "ideas for my daughter's 8th birthday party",
    "make my resume better",
    "call me on 555-123-4567 or 0412 345 678 about the quote",
    "order #1234567890123456 hasn't arrived and I want a refund", // 16 digits, fails Luhn
    "my invoice total is 1,234.56 and the PO is 2026-10-02-0042",
    "the zip code is 90210-1234 and the date is 2026-10-02",
    "write about how to use sk-learn pipelines and kill the process that hangs",
    "the password is required on the form, and passwords should be long",
    "explain the sk-learn-pipeline-with-many-steps-in-sequence naming",
    "I'm dying to try this recipe, and the deadline is killing me",
    "how do I pin a post and cut a video",
    "SSN format question: is 000-12-3456 or 666-12-3456 ever valid?",
  ];
  it.each(ordinary)("no concern: %s", (text) => {
    expect(findConcerns(text)).toEqual([]);
  });
});

describe("findConcerns: Social Security numbers", () => {
  it("flags a formatted SSN anywhere in the text", () => {
    expect(whats("my name is Jane, SSN 123-45-6789. write a letter")).toEqual([
      "a Social Security number",
    ]);
  });

  it("does not flag numbers the SSA never issues", () => {
    for (const fake of ["000-12-3456", "666-12-3456", "912-12-3456", "123-00-6789", "123-45-0000"]) {
      expect(findConcerns(`number ${fake}`)).toEqual([]);
    }
  });

  it("does not flag the lesson's own placeholder example", () => {
    expect(findConcerns("SSN 000-00-0000")).toEqual([]);
  });
});

describe("findConcerns: card numbers", () => {
  it.each([
    "4242424242424242",
    "4242 4242 4242 4242",
    "4242-4242-4242-4242",
    "my amex is 3782 822463 10005",
  ])("flags a Luhn-valid number: %s", (text) => {
    expect(whats(`please dispute a charge on ${text} for me`)).toEqual(["a card number"]);
  });

  it("ignores long digit runs that fail the checksum", () => {
    expect(findConcerns("tracking 4242424242424243")).toEqual([]);
  });

  it("ignores digit runs that are too short or too long to be cards", () => {
    expect(findConcerns("ref 424242424242")).toEqual([]); // 12 digits
    expect(findConcerns("id 42424242424242424242")).toEqual([]); // 20 digits
  });
});

describe("findConcerns: passwords and keys", () => {
  it.each([
    "my password is Summer2024!",
    "password: hunter2",
    "The passcode = Tr0ub4dor&3",
    "key sk-or-v1-0123456789abcdef0123456789abcdef",
    "token ghp_0123456789abcdefghijklmnopqrstuvwxyz",
    "AKIAIOSFODNN7EXAMPLE is the id",
    "-----BEGIN RSA PRIVATE KEY-----",
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
  ])("flags: %s", (text) => {
    expect(whats(text)).toEqual(["a password or access key"]);
  });
});

describe("findConcerns: someone who may be in distress", () => {
  it.each([
    "I want to kill myself",
    "i dont want to live anymore",
    "I don’t want to be here anymore, help me write a note to my sister",
    "thinking about ending my life",
    "how do I stop wanting to hurt myself",
    "I've been struggling with self-harm and want to tell my doctor",
    "everyone would be better off without me",
    "suicidal thoughts again, help me write to my therapist",
  ])("flags: %s", (text) => {
    expect(whats(text)).toContain("distress");
  });

  it("can raise several concerns at once, in a stable order", () => {
    expect(whats("my SSN is 123-45-6789 and I want to die")).toEqual([
      "a Social Security number",
      "distress",
    ]);
  });
});

describe("listWhat", () => {
  it("joins in plain English", () => {
    expect(listWhat([])).toBe("");
    expect(listWhat(["a card number"])).toBe("a card number");
    expect(listWhat(["a card number", "a password"])).toBe("a card number and a password");
    expect(listWhat(["a", "b", "c"])).toBe("a, b, and c");
  });
});
