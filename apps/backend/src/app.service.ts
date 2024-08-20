import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  hello() {
    return { messege: process.env.DATABASE_URL };
  }
}
