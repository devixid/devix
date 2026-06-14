import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({ storage: {}, auth: {} })),
  };
});

import { createClient } from "@supabase/supabase-js";

// We need to reset the module's internal singleton between tests.
// We do this by manipulating env vars and re-importing (the singleton is per-module-instance).
// Since Vitest caches modules, we use vi.resetModules() carefully.

describe("getSupabaseAdmin", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";

    // Re-import fresh module (no cached singleton)
    const { getSupabaseAdmin: freshGet } = await import(
      "@/lib/supabase-admin"
    );
    expect(() => freshGet()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { getSupabaseAdmin: freshGet } = await import(
      "@/lib/supabase-admin"
    );
    expect(() => freshGet()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("creates and returns a Supabase client when env is configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";

    const { getSupabaseAdmin: freshGet } = await import(
      "@/lib/supabase-admin"
    );

    const client = freshGet();
    expect(client).not.toBeNull();
    expect(createClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "service_role_key",
    );
  });

  it("returns the same instance (singleton) on repeated calls", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_role_key";

    const { getSupabaseAdmin: freshGet } = await import(
      "@/lib/supabase-admin"
    );

    const first = freshGet();
    const second = freshGet();
    expect(first).toBe(second);
    // createClient should only have been called once
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
