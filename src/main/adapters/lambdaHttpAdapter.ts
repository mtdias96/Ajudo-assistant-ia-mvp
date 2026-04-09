import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ZodError } from 'zod';
import { Controller } from '@application/contracts/Controller';
import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/http/HttpError';
import { Registry } from '@kernel/di/Registry';
import { lambdaBodyParser } from '@main/utils/lambdaBodyParser';
import { lambdaErrorResponse } from '@main/utils/lambdaErrorResponse';
import { Constructor } from '@shared/types/Constructor';

export function lambdaHttpAdapter<TBody>(controllerImpl: Constructor<Controller<'public', TBody>>) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    try {
      const controller = Registry.getInstance().resolve(controllerImpl);
      const rawBody = event.isBase64Encoded && event.body
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;
      const body = lambdaBodyParser(rawBody);
      const params = event.pathParameters ?? {};
      const queryParams = event.queryStringParameters ?? {};

      const response = await controller.execute({
        body: body as Record<string, unknown>,
        params,
        queryParams,
        accountId: null,
      });

      const responseBody = response.body === undefined
        ? undefined
        : typeof response.body === 'string'
          ? response.body
          : JSON.stringify(response.body);

      return {
        statusCode: response.statusCode,
        body: responseBody,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return lambdaErrorResponse({
          statusCode: 400,
          code: ErrorCode.VALIDATION,
          message: error.issues.map(issue => ({
            field: issue.path.join('.'),
            error: issue.message,
          })),
        });
      }

      if (error instanceof HttpError) {
        return lambdaErrorResponse(error);
      }

      if (error instanceof ApplicationError) {
        return lambdaErrorResponse({
          statusCode: error.statusCode ?? 400,
          code: error.code,
          message: error.message,
        });
      }

      // eslint-disable-next-line no-console
      console.log(error);
      return lambdaErrorResponse({
        statusCode: 500,
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      });
    }
  };
}
