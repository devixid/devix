import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockFileExists,
  resetSupabaseAdminMock,
} from "@/lib/test/mocks/supabase-admin";
import { getTestMocks } from "@/lib/test/mocks/registry";

vi.mock("@/lib/supabase-admin", async () => {
  const { createSupabaseAdminMock } =
    await import("@/lib/test/mocks/supabase-admin");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const supabaseMock = createSupabaseAdminMock();
  getTestMocks().supabase = supabaseMock;
  return {
    getSupabaseAdmin: () => supabaseMock.client,
  };
});

import { getProductFileStatus } from "@/lib/product-storage";

describe("mock kit / supabase-admin", () => {
  beforeEach(() => resetSupabaseAdminMock(getTestMocks().supabase!));

  it("reports existing product files from storage.list", async () => {
    const supabaseMock = getTestMocks().supabase!;
    mockFileExists(supabaseMock.storage, "starter-kit.zip", 2048);

    const status = await getProductFileStatus("starter-kit/starter-kit.zip");

    expect(status).toEqual({ exists: true, sizeBytes: 2048 });
    expect(supabaseMock.bucketFrom).toHaveBeenCalledWith("products");
    expect(supabaseMock.storage.list).toHaveBeenCalled();
  });
});
