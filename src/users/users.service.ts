import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { User } from '../common/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.knex<User>('users').where({ email }).first();
  }

  async createUser({
    name,
    email,
    password,
    role = 'admin',
  }: User): Promise<User> {
    const [newUser] = await this.knex<User>('users')
      .insert({
        name,
        email,
        password,
        role,
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return newUser;
  }
}
