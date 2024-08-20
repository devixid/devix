import { LoggerMiddleware } from "../../src/log/log.middleware";

describe("LogMiddleware", () => {
  it("should be defined", () => {
    expect(new LoggerMiddleware()).toBeDefined();
  });
});
