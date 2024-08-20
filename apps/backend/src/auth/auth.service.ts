import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  HttpCode,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type User } from "@prisma/client";
import { type JwtPayload } from "@/interfaces";
import { type UserDTO } from "src/auth/dto/auth.dto";

@Injectable()
export class AuthService {
  private readonly prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {}

  @HttpCode(200)
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await argon2.verify(user.hash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  @HttpCode(201)
  async createUser(userDTO: UserDTO): Promise<User> {
    const { email, password, ...rest } = userDTO;

    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        hash: hashedPassword,
        ...rest,
      },
    });

    // if (findUser?.role === UserRole.SUPER_ADMIN) {
    return user;
    // } else {
    // throw new UnauthorizedException(
    // "Invalid credentials for create new admin",
    // );
    // }
  }
}
