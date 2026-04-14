import { ErrorCode } from '@application/errors/ErrorCode';
import { ApplicationError } from './ApplicationError';

export class UnsupportedMediaTypeError extends ApplicationError {
  public override statusCode = 415;
  public override code = ErrorCode.UNSUPPORTED_MEDIA_TYPE;

  constructor(mimeType: string) {
    super(`Formato de imagem não suportado: ${mimeType}. Envie JPG, PNG ou WEBP.`);
  }
}
