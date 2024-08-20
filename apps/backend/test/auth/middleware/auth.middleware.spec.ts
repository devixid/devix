/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { Test, type TestingModule } from "@nestjs/testing";
import { AuthMiddleware } from "../../../src/auth/middleware/auth.middleware";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import type * as express from "express";

describe("AuthMiddleware", () => {
  let middleware: AuthMiddleware;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    jwtService = module.get<JwtService>(JwtService);
  });

  // ... Test cases
  it("should throw UnauthorizedException when no auth header", async () => {
    const req = { headers: {} } as express.Request;
    const res = {} as express.Response;
    const next: express.NextFunction = jest.fn();

    await expect(middleware.use(req, res, next)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedException when invalid token", async () => {
    const req = {
      headers: { authorization: "Bearer invalid_token" },
    } as express.Request;
    const res = {} as express.Response;
    const next = jest.fn();

    jest
      .spyOn(jwtService, "verifyAsync")
      .mockRejectedValueOnce(new Error("Invalid token"));

    await expect(middleware.use(req, res, next)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with decoded user", async () => {
    const req = {
      headers: {
        authorization: "Bearer valid_token",
      },
    } as express.Request;
    const res = {} as express.Response;
    const next: express.NextFunction = jest.fn();
    const decodedUser = { id: 1, email: "user@example.com" };

    jest.spyOn(jwtService, "verifyAsync").mockResolvedValueOnce(decodedUser);

    await middleware.use(req, res, next);

    expect(req.user).toBe(decodedUser);
    expect(next).toHaveBeenCalled();
  });
});
