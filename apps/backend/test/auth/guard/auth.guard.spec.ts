import { JwtAuthGuard } from "../../../src/auth/guard/auth.guard";
import { Test, type TestingModule } from "@nestjs/testing";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it("should return the payload", () => {
    const payload = { id: 3, email: "dragdimas9@gmail.com" };
    expect(guard.validate(payload)).toBe(payload);
  });
});
