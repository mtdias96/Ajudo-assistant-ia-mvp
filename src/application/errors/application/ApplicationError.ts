import { ErrorCode } from '@application/errors/ErrorCode';

export class ApplicationError extends Error {
  public statusCode: number = 400;
  public code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;

  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
