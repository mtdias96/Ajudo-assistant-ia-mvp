import { ErrorCode } from '@application/errors/ErrorCode';
import { APIGatewayProxyResultV2 } from 'aws-lambda';

interface ErrorResponseInput {
  statusCode: number;
  code: ErrorCode;
  message: unknown;
}

export function lambdaErrorResponse(error: ErrorResponseInput): APIGatewayProxyResultV2 {
  return {
    statusCode: error.statusCode,
    body: JSON.stringify({
      code: error.code,
      message: error.message,
    }),
  };
}
