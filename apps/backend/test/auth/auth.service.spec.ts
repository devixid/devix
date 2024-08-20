import { AuthService } from "../../src/auth/auth.service";
import type { JwtService } from "@nestjs/jwt";

describe("AuthService", () => {
  let jwtService: JwtService;

  it("should be defined", () => {
    expect(new AuthService(jwtService)).toBeDefined();
  });
});
