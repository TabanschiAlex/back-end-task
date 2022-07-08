import express, { Express } from 'express';
import 'dotenv/config';

import { initSequelizeClient } from './sequelize';
import { initUsersRouter } from './routers';
import { initErrorRequestHandler, initNotFoundRequestHandler } from './middleware';
import { initPostsRouter } from './routers/posts';

const PORT = 8080;

export default async function main(): Promise<Express> {
  const app = express();

  const sequelizeClient = await initSequelizeClient();

  app.use(express.json());

  app.use('/api/v1/users', initUsersRouter(sequelizeClient));
  app.use('/api/v1/posts', initPostsRouter(sequelizeClient));

  app.use('/', initNotFoundRequestHandler());
  app.use(initErrorRequestHandler());

  return app;
}

main().then((app) => {
  app.listen(PORT, () => console.info(`app listening on port: '${PORT}'`));
}).catch(console.error);