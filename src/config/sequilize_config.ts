import type { SetupSequelizeParams } from '../types/types';

export const sequelize_config: SetupSequelizeParams = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'postgres',
};
