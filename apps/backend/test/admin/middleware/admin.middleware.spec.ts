import { AdminMiddleware } from "../../../src/admin/middleware/admin.middleware";

describe("AdminMiddleware", () => {
  it("should be defined", () => {
    expect(new AdminMiddleware()).toBeDefined();
  });
});
