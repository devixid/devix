import type { AuthService } from "../../src/auth/auth.service";
import { AuthController } from "../../src/auth/auth.controller";

describe("AuthController", () => {
  let authService: AuthService;

  it("should be defined", () => {
    expect(new AuthController(authService)).toBeDefined();
  });
});
