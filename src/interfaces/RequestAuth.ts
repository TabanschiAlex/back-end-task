import { User } from '../repositories/users';

export interface RequestAuth {
  token: string;
  user: User;
  scope?: string;
}