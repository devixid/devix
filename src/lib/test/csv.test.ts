import { describe, expect, it } from "vitest";
import { toCsvContent, toCsvRow } from "@/lib/csv";

describe("toCsvRow", () => {
  it("quotes fields containing commas", () => {
    expect(toCsvRow(["name", "Hello, world"])).toBe('name,"Hello, world"');
  });

  it("prefixes formula-like values to prevent CSV injection", () => {
    expect(toCsvRow(["=SUM(A1)"])).toBe("'=SUM(A1)");
  });

  it("escapes embedded double quotes", () => {
    expect(toCsvRow(['He said "hi"'])).toBe('"He said ""hi"""');
  });
});

describe("toCsvContent", () => {
  it("adds BOM and CRLF line endings", () => {
    const csv = toCsvContent(["A", "B"], [["1", "2"]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toBe('\uFEFFA,B\r\n1,2');
  });
});
