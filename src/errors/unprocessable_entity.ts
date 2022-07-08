import { HttpError } from './http';

export class UnprocessableEntity extends HttpError {
  constructor(message: string) {
    super(message, 422);
  }
}