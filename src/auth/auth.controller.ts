import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import {
  type LoginDto,
  loginSchema,
  type SignupDto,
  signupSchema,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(
    @Body() singupDto: SignupDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.signup(singupDto, res);
    res.status(201).json({ data: result });
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const result = await this.authService.login(loginDto, res);
    res.status(201).json({ data: result });
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('refresh_token', '', {
      maxAge: 0,
    });

    return { message: 'Logged out' };
  }
}
