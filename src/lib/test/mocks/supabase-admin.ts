import { vi, type Mock } from "vitest";

export type SupabaseStorageMocks = {
  list: Mock;
  createSignedUrl: Mock;
  upload: Mock;
  remove: Mock;
};

export type SupabaseAdminMock = {
  client: {
    storage: {
      from: Mock;
    };
  };
  storage: SupabaseStorageMocks;
  bucketFrom: Mock;
};

export function buildSupabaseAdminMocks(): SupabaseAdminMock {
  return createSupabaseAdminMock();
}

export function createSupabaseAdminMock(): SupabaseAdminMock {
  const storage: SupabaseStorageMocks = {
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
    createSignedUrl: vi
      .fn()
      .mockResolvedValue({ data: { signedUrl: "" }, error: null }),
    upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const bucketFrom = vi.fn(() => storage);

  const client = {
    storage: {
      from: bucketFrom,
    },
  };

  return { client, storage, bucketFrom };
}

export function mockFileExists(
  storage: SupabaseStorageMocks,
  name: string,
  sizeBytes = 1024,
): void {
  storage.list.mockResolvedValue({
    data: [{ name, metadata: { size: sizeBytes } }],
    error: null,
  });
}

export function mockSignedUrl(
  storage: SupabaseStorageMocks,
  signedUrl: string,
): void {
  storage.createSignedUrl.mockResolvedValue({
    data: { signedUrl },
    error: null,
  });
}

export function resetSupabaseAdminMock(mock: SupabaseAdminMock): void {
  mock.storage.list.mockReset().mockResolvedValue({ data: [], error: null });
  mock.storage.createSignedUrl
    .mockReset()
    .mockResolvedValue({ data: { signedUrl: "" }, error: null });
  mock.storage.upload.mockReset().mockResolvedValue({ data: {}, error: null });
  mock.storage.remove.mockReset().mockResolvedValue({ data: [], error: null });
  mock.bucketFrom.mockReset().mockImplementation(() => mock.storage);
}
