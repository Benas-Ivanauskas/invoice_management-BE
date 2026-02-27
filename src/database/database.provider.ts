import Knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

export const databaseProvider = [
  {
    provide: 'KNEX_CONNECTION',
    useFactory: () => {
      const knex = Knex({
        client: 'pg',
        connection: process.env.DATABASE_URL,
        pool: { min: 2, max: 10 },
      });

      return knex;
    },
  },
];
