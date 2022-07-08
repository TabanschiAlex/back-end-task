import { Router, RequestHandler } from 'express';
import { Op } from 'sequelize';

import type { SequelizeClient } from '../sequelize';
import type { User } from '../repositories/types';
import type { CreateUserData } from '../types/types';

import { BadRequestError, UnauthorizedError } from '../errors';
import { hashPassword, generateToken, validatePassword } from '../security';
import { initTokenValidationRequestHandler, initAdminValidationRequestHandler } from '../middleware';
import { UserType } from '../constants';
import { TokenData } from '../interfaces/TokenData';
import { RequestAuth } from '../interfaces/RequestAuth';
import { LoginUserData } from '../types/types';
import {
  createUserValidateFields,
  loginUserValidateFields,
  registerUserValidateFields,
} from '../validators/UserValidator';

export function initUsersRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({mergeParams: true});

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
  const adminValidation = initAdminValidationRequestHandler();

  router.route('/')
    .get(tokenValidation, initListUsersRequestHandler(sequelizeClient))
    .post(tokenValidation, adminValidation, initCreateUserRequestHandler(sequelizeClient));

  router.route('/login')
    .post(initLoginUserRequestHandler(sequelizeClient));
  router.route('/register')
    .post(initRegisterUserRequestHandler(sequelizeClient));

  return router;
}

function initListUsersRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function listUsersRequestHandler(req, res, next): Promise<void> {
    const {models} = sequelizeClient;

    try {
      const {auth: {user: {type: userType}}} = req as unknown as { auth: RequestAuth };
      const isAdmin = userType === UserType.ADMIN;

      const users = await models.users.findAll({
        attributes: isAdmin ? ['id', 'name', 'email'] : ['name', 'email'],
        ...!isAdmin && {where: {type: {[Op.ne]: UserType.ADMIN}}},
        raw: true,
      });

      return res.send(users).end();
    } catch (error) {
      next(error);
    }
  };
}

function initCreateUserRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function createUserRequestHandler(req, res, next): Promise<void> {
    try {
      const data = registerUserValidateFields(req.body as CreateUserData);
      await createUser(data, sequelizeClient);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

function initLoginUserRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function loginUserRequestHandler(req, res, next): Promise<void> {
    const {models} = sequelizeClient;

    try {
      const {email, password} = loginUserValidateFields(req.body as LoginUserData);

      const user = await models.users.findOne({
        attributes: ['id', 'passwordHash'],
        where: {email},
        raw: true,
      }) as Pick<User, 'id' | 'passwordHash'> | null;

      if (!user) {
        throw new UnauthorizedError('EMAIL_OR_PASSWORD_INCORRECT');
      }

      if (!(await validatePassword(password, user.passwordHash))) {
        throw new UnauthorizedError('EMAIL_OR_PASSWORD_INCORRECT');
      }

      const data = {id: user.id} as TokenData;
      const token = generateToken(data);

      return res.send({token}).end();
    } catch (error) {
      next(error);
    }
  };
}

function initRegisterUserRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function createUserRequestHandler(req, res, next): Promise<void> {
    try {
      const data = createUserValidateFields(req.body as Omit<CreateUserData, 'type'>);
      await createUser({type: UserType.BLOGGER, ...data}, sequelizeClient);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

async function createUser(data: CreateUserData, sequelizeClient: SequelizeClient): Promise<void> {
  const {type, name, email, password} = data;
  const {models} = sequelizeClient;

  const similarUser = await models.users.findOne({
    attributes: ['id', 'name', 'email'],
    where: {
      [Op.or]: [
        {name},
        {email},
      ],
    },
    raw: true,
  }) as Pick<User, 'id' | 'name' | 'email'> | null;

  if (similarUser) {
    if (similarUser.name === name) {
      throw new BadRequestError('NAME_ALREADY_USED');
    }
    if (similarUser.email === email) {
      throw new BadRequestError('EMAIL_ALREADY_USED');
    }
  }

  const hashedPassword: string = await hashPassword(password);

  await models.users.create({type, name, email, passwordHash: hashedPassword});
}
