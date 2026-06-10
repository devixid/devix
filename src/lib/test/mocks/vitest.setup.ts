/**
 * Safe defaults for unit tests. Does not restore mocks globally — each test
 * file should reset its own mocks in beforeEach.
 */
process.env.JWT_SECRET ??= "vitest-jwt-secret";
process.env.DATABASE_URL ??= "postgresql://vitest:vitest@localhost:5432/vitest";
