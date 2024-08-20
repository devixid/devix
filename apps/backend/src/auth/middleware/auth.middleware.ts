import {
  Injectable,
  type NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException("Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
