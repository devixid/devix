import { PROFANITY_WORDLIST } from "@/lib/profanity-wordlist";

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

/** Lowercase, strip non-letters, collapse repeats, map basic leetspeak. */
export function normalizeForModeration(text: string): string {
  let normalized = text.toLowerCase();

  normalized = normalized
    .split("")
    .map((char) => LEET_MAP[char] ?? char)
    .join("");

  normalized = normalized.replace(/[^a-z\s]/g, " ");
  normalized = normalized.replace(/(.)\1{2,}/g, "$1$1");
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

export function containsProfanity(text: string): boolean {
  const normalized = normalizeForModeration(text);
  if (!normalized) return false;

  const tokens = normalized.split(" ").filter(Boolean);

  for (const word of PROFANITY_WORDLIST) {
    if (tokens.includes(word)) return true;
    if (normalized.includes(word)) return true;
  }

  return false;
}
