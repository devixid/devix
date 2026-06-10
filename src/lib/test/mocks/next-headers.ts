import { vi, type Mock } from "vitest";

export type NextHeadersMock = {
  headers: Mock<() => Promise<Headers>>;
  cookies: Mock<
    () => Promise<{
      get: (name: string) => { value: string } | undefined;
      set: Mock;
      delete: Mock;
    }>
  >;
  cookieStore: Map<string, string>;
  setRequestHeaders: (headers: Record<string, string>) => void;
  setCookie: (name: string, value: string) => void;
  clearCookies: () => void;
};

export function buildNextHeadersMocks(): NextHeadersMock {
  return createNextHeadersMock();
}

export function createNextHeadersMock(): NextHeadersMock {
  let requestHeaders = new Headers();
  const cookieStore = new Map<string, string>();

  const cookies = vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value ? { value } : undefined;
    },
    set: vi.fn((name: string, value: string) => {
      cookieStore.set(name, value);
    }),
    delete: vi.fn((name: string) => {
      cookieStore.delete(name);
    }),
  }));

  const headers = vi.fn(async () => requestHeaders);

  return {
    headers,
    cookies,
    cookieStore,
    setRequestHeaders(next: Record<string, string>) {
      requestHeaders = new Headers(next);
    },
    setCookie(name: string, value: string) {
      cookieStore.set(name, value);
    },
    clearCookies() {
      cookieStore.clear();
    },
  };
}

export function mockAllowedOrigin(
  mock: NextHeadersMock,
  origin: string,
  host = "devix.test",
): void {
  mock.setRequestHeaders({
    origin,
    host,
    "x-forwarded-proto": "https",
  });
}

export function mockAdminSessionCookies(
  mock: NextHeadersMock,
  token = "session-token-fixture",
  cookieName = "devix_session",
): void {
  mock.setCookie(cookieName, token);
}

export function resetNextHeadersMock(mock: NextHeadersMock): void {
  mock.setRequestHeaders({});
  mock.clearCookies();
  mock.headers.mockClear();
  mock.cookies.mockClear();
}
