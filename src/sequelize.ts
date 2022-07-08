import { Sequelize } from 'sequelize';

import type { PostsModel, UsersModel } from './repositories/types';

import { setupPostsModel, setupUsersModel } from './models';
import { sequelize_config } from './config/sequilize_config';

const postsModelName = 'posts';
const usersModelName = 'users';

export async function initSequelizeClient(): Promise<SequelizeClient> {
  const { dialect, host, port, username, password, database } = sequelize_config;

  const sequelizeClient = new Sequelize({ dialect, host, port, username, password, database, logging: false });

  setupUsersModel(usersModelName, sequelizeClient);
  setupPostsModel(postsModelName, sequelizeClient);

  associateModels(sequelizeClient.models as unknown as SequelizeModels);

  // NOTE(roman): this creates the tables in the database for add the defined models, if they don't already exist
  await sequelizeClient.sync();

  return sequelizeClient as unknown as SequelizeClient;
}

function associateModels(models: SequelizeModels): void {
  for (const model of Object.values((models))) {
    const associate = (model as ModelWithPossibleAssociations).associate?.bind(model);
    if (associate) {
      associate(models);
    }
  }
}

export interface SequelizeModels {
  [usersModelName]: UsersModel;
  [postsModelName]: PostsModel;
}

interface ModelWithPossibleAssociations {
  associate?(models: SequelizeModels): void;
}

// @ts-expect-error sequelize was not built for this kind of modifications
export interface SequelizeClient extends Sequelize {
  models: SequelizeModels;
}