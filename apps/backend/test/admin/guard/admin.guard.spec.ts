import { AdminGuard } from "../../../src/admin/guard/admin.guard";

describe("AdminGuard", () => {
  it("should be defined", () => {
    expect(new AdminGuard()).toBeDefined();
  });
});
