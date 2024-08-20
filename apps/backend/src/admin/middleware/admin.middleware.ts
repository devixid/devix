import { Injectable, type NestMiddleware } from "@nestjs/common";
import { type Request, type Response } from "express";

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    next();
  }
}
