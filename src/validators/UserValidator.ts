import { CreateUserData, LoginUserData } from '../types/types';
import { UnprocessableEntity } from '../errors/unprocessable_entity';
import { BadRequestError } from '../errors';

export function registerUserValidateFields(data: CreateUserData): CreateUserData {
  if (!data.type) {
    throw new UnprocessableEntity('Field type is required');
  }

  if (!data.email) {
    throw new UnprocessableEntity('Field email is required');
  }

  if (!data.password) {
    throw new UnprocessableEntity('Field password is required');
  }

  if (!data.passwordConfirmation) {
    throw new UnprocessableEntity('Field passwordConfirmation is required');
  }

  if (!data.name) {
    throw new UnprocessableEntity('Field name is required');
  }

  if (data.password !== data.passwordConfirmation) {
    throw new BadRequestError('PASSWORDS_NOT_NOT_SIMILAR');
  }

  return data;
}

export function loginUserValidateFields(data: LoginUserData): LoginUserData {
  if (!data.email) {
    throw new UnprocessableEntity('Field email is required');
  }

  if (!data.password) {
    throw new UnprocessableEntity('Field password is required');
  }

  return data;
}

export function createUserValidateFields(data: Omit<CreateUserData, 'type'>): Omit<CreateUserData, 'type'> {
  if (!data.email) {
    throw new UnprocessableEntity('Field email is required');
  }

  if (!data.name) {
    throw new UnprocessableEntity('Field name is required');
  }

  if (!data.password) {
    throw new UnprocessableEntity('Field password is required');
  }

  return data;
}