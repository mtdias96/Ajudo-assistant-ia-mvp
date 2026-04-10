import { ErrorCode } from '@application/errors/ErrorCode';
import { ApplicationError } from './ApplicationError';

export class ProcessIncomingMessageError extends ApplicationError {
  public override statusCode = 500;
  public override code = ErrorCode.INTERNAL_SERVER_ERROR;

  constructor() {
    super('Desculpe, não consegui processar sua mensagem. Tente novamente em alguns instantes.');
  }
}
