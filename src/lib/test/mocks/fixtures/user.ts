export type UserFixture = {
  id: string;
  email: string;
  hashedPassword: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function buildUser(overrides: Partial<UserFixture> = {}): UserFixture {
  return {
    id: "user_fixture_1",
    email: "admin@example.com",
    hashedPassword: "hashed-password-fixture",
    firstName: "Admin",
    lastName: "User",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
