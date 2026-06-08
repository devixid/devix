import { describe, expect, it } from "vitest";
import {
  buildProductFileKey,
  isAllowedProductExtension,
  resolveProductStoragePath,
  sanitizeProductFilename,
} from "@/lib/product-storage";

describe("resolveProductStoragePath", () => {
  it("strips leading slashes and bucket prefix", () => {
    expect(resolveProductStoragePath("/products/my-slug/file.zip")).toBe(
      "my-slug/file.zip",
    );
    expect(resolveProductStoragePath("my-slug/file.zip")).toBe(
      "my-slug/file.zip",
    );
  });
});

describe("sanitizeProductFilename", () => {
  it("normalizes unsafe stems and preserves allowed extensions", () => {
    expect(sanitizeProductFilename("../My Cool File.PDF")).toBe(
      "my-cool-file.pdf",
    );
  });

  it("defaults to .zip when extension is unknown", () => {
    expect(sanitizeProductFilename("readme.txt")).toBe("readme-txt.zip");
  });
});

describe("buildProductFileKey", () => {
  it("combines slug and sanitized filename", () => {
    expect(buildProductFileKey("starter-kit", "My Kit.zip")).toBe(
      "starter-kit/my-kit.zip",
    );
  });
});

describe("isAllowedProductExtension", () => {
  it("accepts supported archive/document types", () => {
    expect(isAllowedProductExtension("bundle.tar.gz")).toBe(true);
    expect(isAllowedProductExtension("notes.pdf")).toBe(true);
    expect(isAllowedProductExtension("readme.txt")).toBe(false);
  });
});
