import { RequestHandler } from 'express';

import type { SequelizeClient } from '../sequelize';

import { ForbiddenError, UnauthorizedError } from '../errors';
import { UserType } from '../constants';
import { extraDataFromToken, isValidToken } from '../security';
import { RequestAuth } from '../interfaces/RequestAuth';

export function initTokenValidationRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function tokenValidationRequestHandler(req, res, next): Promise<void> {
    try {
      const {models} = sequelizeClient;

      const authorizationHeaderValue = req.header('authorization');
      if (!authorizationHeaderValue) {
        throw new UnauthorizedError('AUTH_MISSING');
      }

      const [type, token] = authorizationHeaderValue.split(' ');
      if (type?.toLowerCase() !== 'bearer') {
        throw new UnauthorizedError('AUTH_WRONG_TYPE');
      }

      if (!token) {
        throw new UnauthorizedError('AUTH_TOKEN_MISSING');
      }

      if (!isValidToken(token)) {
        throw new UnauthorizedError('AUTH_TOKEN_INVALID');
      }

      const {id} = extraDataFromToken(token);
      const user = await models.users.findByPk(id);

      if (!user) {
        throw new UnauthorizedError('AUTH_TOKEN_INVALID');
      }

      (req as unknown as { auth: RequestAuth }).auth = {
        token,
        user,
      } as RequestAuth;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

// NOTE(roman): assuming that `tokenValidationRequestHandler` is placed before
export function initAdminValidationRequestHandler(): RequestHandler {
  return function tokenValidationRequestHandler(req, res, next): void {
    try {
      const {auth} = req as unknown as { auth: RequestAuth };

      if (!auth.user) {
        throw new UnauthorizedError('AUTH_MISSING');
      }

      if (auth.user.type !== UserType.ADMIN) {
        throw new ForbiddenError('FORBIDDEN');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };

}

export function initScopeValidationRequestHandler(): RequestHandler {
  return function validationRequestHandler(req, res, next): void {
    try {
      const {auth} = req as unknown as { auth: RequestAuth };

      if (!auth.user) {
        throw new UnauthorizedError('AUTH_MISSING');
      }

      if (auth.user.type !== UserType.ADMIN) {
        auth.scope = UserType.BLOGGER;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };

}