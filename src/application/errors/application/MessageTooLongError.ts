import { ErrorCode } from '@application/errors/ErrorCode';
import { ApplicationError } from './ApplicationError';

export class MessageTooLongError extends ApplicationError {
  public override statusCode = 400;
  public override code = ErrorCode.MESSAGE_TOO_LONG;

  constructor(maxLength: number) {
    super(`Sua mensagem é muito longa. Envie no máximo ${maxLength} caracteres.`);
  }
}
