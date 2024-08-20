import { PrismaClient, type User } from "@prisma/client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService {
  private readonly prisma = new PrismaClient();

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }
}
