import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { compare, hash } from './utils/bcrypt.util';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User } from '../common/interfaces/user.interface';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async signup(singupDto: SignupDto, res: Response) {
    try {
      const { name, email, password, role = 'user' } = singupDto;
      if (!name || !email || !password) {
        throw new BadRequestException('All fields are required');
      }
      const existingUser: User | undefined =
        await this.userService.findOneByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
      const hashPassword = await hash(password);

      const insertUser = await this.userService.createUser({
        name,
        email,
        password: hashPassword,
        role,
      });

      const payload: JwtPayload = {
        sub: String(insertUser.id),
        email: insertUser.email,
        role,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });

      res.cookie('refresh_token', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });

      return { access_token: accessToken, message: 'Success' };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Signup err:', err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    try {
      const { email, password } = loginDto;
      if (!email || !password) {
        throw new BadRequestException('All fields are required');
      }
      const existingUser = await this.userService.findOneByEmail(email);
      if (!existingUser) {
        throw new UnauthorizedException("Email adress doesn't exists");
      }
      const comparePassword = await compare(existingUser.password, password);
      if (!comparePassword) {
        throw new UnauthorizedException('Email or password is wrong');
      }
      const payload: JwtPayload = {
        sub: String(existingUser.id),
        email: email,
        role: existingUser.role,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });

      res.cookie('refresh_token', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
      return { access_token: accessToken, message: 'Success' };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      console.error('Login err:', err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
