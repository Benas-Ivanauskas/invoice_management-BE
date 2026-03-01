import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const Roles = Reflector.createDecorator<string>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string>(Roles, context.getHandler());

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('No user role found');
    }
    const hasRole = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission');
    }
    return true;
  }
}
