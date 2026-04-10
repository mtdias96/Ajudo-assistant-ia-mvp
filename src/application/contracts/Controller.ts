import { getSchema } from '@kernel/decorators/Schema';

type TRouteType = 'public' | 'private' | 'webhook';

export abstract class Controller<TType extends TRouteType, TBody = undefined> {
  protected abstract handle(request: Controller.Request<TType>): Promise<Controller.Response<TBody>>;

  public execute(raw: Controller.RawRequest): Promise<Controller.Response<TBody>> {
    const body = this.validateBody(raw.body);

    return this.handle({
      ...raw,
      body,
    } as unknown as Controller.Request<TType>);
  }

  private validateBody(body: unknown) {
    const schema = getSchema(this);

    if (!schema) {
      return body;
    }

    return schema.parse(body);
  }
}

export namespace Controller {
  export type Context = {
    userId: string;
    channel: 'whatsapp';
  };

  type BaseRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
    context?: Context;
  };

  type PublicRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams>;

  type PrivateRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: string;
  };

  type WebhookRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    whatsAppId: string;
  };

  export type Request<
    TType extends TRouteType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = TType extends 'public'
    ? PublicRequest<TBody, TParams, TQueryParams>
    : TType extends 'private'
      ? PrivateRequest<TBody, TParams, TQueryParams>
      : WebhookRequest<TBody, TParams, TQueryParams>;

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };

  /**
   * Forma "achatada" que o adapter HTTP entrega ao Controller.
   * Os campos de identidade (accountId / whatsAppId) chegam sempre, podendo ser
   * `null` quando a rota não tem aquela informação. O `execute` reescreve esse
   * payload no formato strict de `Request<TType>` esperado pelo `handle`.
   */
  export type RawRequest = {
    body: unknown;
    params: Record<string, unknown>;
    queryParams: Record<string, unknown>;
    accountId: string | null;
    whatsAppId: string | null;
  };
}
