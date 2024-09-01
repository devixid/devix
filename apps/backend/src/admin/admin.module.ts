import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
// eslint-disable-next-line prettier/prettier
export class AdminModule {}
