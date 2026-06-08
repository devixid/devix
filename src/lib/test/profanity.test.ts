import { describe, expect, it } from "vitest";
import { containsProfanity, normalizeForModeration } from "@/lib/profanity";

describe("normalizeForModeration", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeForModeration("Hello, World!")).toBe("hello world");
  });

  it("maps basic leetspeak", () => {
    expect(normalizeForModeration("f@ck")).toBe("fack");
  });
});

describe("containsProfanity", () => {
  it("allows clean comments", () => {
    expect(containsProfanity("Pelayanan sangat ramah dan cepat.")).toBe(false);
    expect(containsProfanity("Great experience scheduling consultation.")).toBe(
      false,
    );
  });

  it("blocks profane words", () => {
    expect(containsProfanity("layanan ini goblok")).toBe(true);
    expect(containsProfanity("what the fuck")).toBe(true);
  });

  it("blocks basic leetspeak bypass attempts", () => {
    expect(containsProfanity("sh1t service")).toBe(true);
    expect(containsProfanity("b4st4rd")).toBe(true);
  });
});
