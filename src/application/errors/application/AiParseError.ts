import { ErrorCode } from '@application/errors/ErrorCode';
import { ApplicationError } from './ApplicationError';

export class AiParseError extends ApplicationError {
  public override statusCode = 500;
  public override code = ErrorCode.AI_PARSE_FAILURE;

  constructor(rawContent: string) {
    super(`AI returned invalid JSON: ${rawContent.slice(0, 200)}`);
  }
}
