import { ErrorCode } from '@application/errors/ErrorCode';
import { ApplicationError } from './ApplicationError';

export class InvalidMediaCountError extends ApplicationError {
  public override statusCode = 400;
  public override code = ErrorCode.INVALID_MEDIA_COUNT;

  constructor() {
    super('Envie exatamente uma imagem por vez.');
  }
}
