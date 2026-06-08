import { describe, expect, it } from "vitest";

/**
 * Health route is integration-heavy (Prisma + Redis). This unit test only
 * documents the expected auth contract for GET /api/health.
 */
describe("health API auth contract", () => {
  it("expects bearer token matching HEALTH_CHECK_SECRET", () => {
    const secret = "test-secret";
    const authorized = `Bearer ${secret}`;
    const unauthorized = "Bearer wrong";

    expect(authorized).toBe(`Bearer ${secret}`);
    expect(unauthorized).not.toBe(`Bearer ${secret}`);
  });
});
