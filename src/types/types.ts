import { Options } from 'sequelize';
import { User } from '../repositories/users';
import { Post } from '../repositories/posts';

export type SetupSequelizeParams = Pick<Options, 'dialect' | 'host' | 'port' | 'username' | 'password' | 'database'>;

export type CreateUserData = Pick<User, 'type' | 'name' | 'email' > & { password: User['passwordHash'], passwordConfirmation: string };

export type LoginUserData = Pick<User, 'email' > & { password: User['passwordHash'] };

export type CreatePostData = Pick<Post, 'authorId' | 'title' | 'isHidden' | 'content'>;