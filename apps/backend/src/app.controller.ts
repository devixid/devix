import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("/")
export class AppController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly appService: AppService) {}

  @Get()
  hello() {
    return this.appService.hello();
  }
}
