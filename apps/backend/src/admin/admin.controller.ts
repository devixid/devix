import { GetUser } from "@/auth/decorator/getuser.decorator";
import { JwtAuthGuard } from "@/auth/guard/auth.guard";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class AdminController {
  @Get("me")
  GetMe(@GetUser() user: User) {
    return user;
  }
}
