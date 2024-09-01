import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO, CreateUserDTO } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guard/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() authDTO: AuthDTO) {
    return await this.authService.login(authDTO.email, authDTO.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post("create-user")
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.authService.createUser(createUserDTO);
  }
}
