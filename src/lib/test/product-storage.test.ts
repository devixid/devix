import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildProductFileKey,
  isAllowedProductExtension,
  resolveProductStoragePath,
  sanitizeProductFilename,
  getProductFileStatus,
  assertProductFileExists,
  uploadProductFile,
  deleteProductFile,
} from "@/lib/product-storage";
import {
  createSupabaseAdminMock,
  mockFileExists,
  resetSupabaseAdminMock,
} from "@/lib/test/mocks/supabase-admin";

const supabaseMock = createSupabaseAdminMock();

vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => supabaseMock.client,
}));

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

describe("getProductFileStatus", () => {
  beforeEach(() => {
    resetSupabaseAdminMock(supabaseMock);
  });

  it("returns exists: false when Supabase returns an error", async () => {
    supabaseMock.storage.list.mockResolvedValueOnce({
      data: null,
      error: { message: "Access Denied", name: "StorageError", status: 403 },
    });

    const status = await getProductFileStatus("starter-kit/file.zip");
    expect(status.exists).toBe(false);
  });

  it("returns exists: false when the file is not found in the list", async () => {
    supabaseMock.storage.list.mockResolvedValueOnce({
      data: [{ name: "other-file.zip", metadata: { size: 100 } }],
      error: null,
    });

    const status = await getProductFileStatus("starter-kit/file.zip");
    expect(status.exists).toBe(false);
  });

  it("returns exists: false when metadata size is 0 or negative", async () => {
    supabaseMock.storage.list.mockResolvedValueOnce({
      data: [{ name: "file.zip", metadata: { size: 0 } }],
      error: null,
    });

    const status = await getProductFileStatus("starter-kit/file.zip");
    expect(status.exists).toBe(false);
  });

  it("returns exists: true with size when everything is valid", async () => {
    mockFileExists(supabaseMock.storage, "file.zip", 2048);

    const status = await getProductFileStatus("starter-kit/file.zip");
    expect(status.exists).toBe(true);
    expect(status.sizeBytes).toBe(2048);
  });
});

describe("assertProductFileExists", () => {
  beforeEach(() => {
    resetSupabaseAdminMock(supabaseMock);
  });

  it("returns true when file exists", async () => {
    mockFileExists(supabaseMock.storage, "file.zip", 1024);
    const result = await assertProductFileExists("starter-kit/file.zip");
    expect(result).toBe(true);
  });

  it("returns false when file does not exist", async () => {
    supabaseMock.storage.list.mockResolvedValueOnce({ data: [], error: null });
    const result = await assertProductFileExists("starter-kit/file.zip");
    expect(result).toBe(false);
  });
});

describe("uploadProductFile", () => {
  beforeEach(() => {
    resetSupabaseAdminMock(supabaseMock);
  });

  it("uploads the file successfully", async () => {
    await uploadProductFile("starter-kit/file.zip", Buffer.from("data"), "application/zip");
    expect(supabaseMock.storage.upload).toHaveBeenCalledWith("starter-kit/file.zip", expect.any(Buffer), {
      contentType: "application/zip",
      upsert: true,
    });
  });

  it("throws an error when upload fails", async () => {
    supabaseMock.storage.upload.mockResolvedValueOnce({
      data: null,
      error: { message: "Upload failed", name: "StorageError", status: 500 },
    });

    await expect(
      uploadProductFile("starter-kit/file.zip", Buffer.from("data"), "application/zip"),
    ).rejects.toThrow(/Product upload failed: Upload failed/);
  });
});

describe("deleteProductFile", () => {
  beforeEach(() => {
    resetSupabaseAdminMock(supabaseMock);
  });

  it("deletes the file successfully", async () => {
    await deleteProductFile("starter-kit/file.zip");
    expect(supabaseMock.storage.remove).toHaveBeenCalledWith(["starter-kit/file.zip"]);
  });

  it("throws an error when deletion fails", async () => {
    supabaseMock.storage.remove.mockResolvedValueOnce({
      data: null,
      error: { message: "Delete failed", name: "StorageError", status: 500 },
    });

    await expect(deleteProductFile("starter-kit/file.zip")).rejects.toThrow(
      /Product file delete failed: Delete failed/,
    );
  });
});
