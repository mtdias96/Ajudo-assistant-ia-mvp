import { APIGatewayProxyEventV2 } from 'aws-lambda';

/**
 * Decodifica o body do evento Lambda em um objeto.
 *
 * Suporta:
 * - JSON (`application/json` ou content-type ausente)
 * - Form URL encoded (`application/x-www-form-urlencoded`) — usado pelo Twilio
 * - Bodies em base64 (quando o API Gateway sinaliza `isBase64Encoded`)
 */
export function lambdaBodyParser(event: APIGatewayProxyEventV2): Record<string, unknown> {
  const { body, isBase64Encoded } = event;

  if (!body) {
    return {};
  }

  const raw = isBase64Encoded
    ? Buffer.from(body, 'base64').toString('utf-8')
    : body;

  const headers = event.headers ?? {};
  const contentType = (headers['content-type'] ?? headers['Content-Type'] ?? '').toLowerCase();

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Malformed body.');
  }
}
