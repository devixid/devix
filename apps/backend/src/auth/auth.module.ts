import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt/dist";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategies";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
// eslint-disable-next-line prettier/prettier
export class AuthModule {}
