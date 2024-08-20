import {
  type NestModule,
  type MiddlewareConsumer,
  Module,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppService } from "./app.service";
import { AuthService } from "./auth/auth.service";
import { AdminService } from "./admin/admin.service";
import { AuthController } from "./auth/auth.controller";
import { JwtStrategy } from "./auth";
import { LoggerMiddleware } from "./log/log.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, AdminService, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
