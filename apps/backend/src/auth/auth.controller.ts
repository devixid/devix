import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserDTO } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guard/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() userDTO: UserDTO) {
    return await this.authService.login(userDTO.email, userDTO.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post("create-user")
  async createUser(@Body() userDTO: UserDTO) {
    return await this.authService.createUser(userDTO);
  }
}
