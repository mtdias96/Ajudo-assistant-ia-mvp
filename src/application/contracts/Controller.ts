import { getSchema } from '@kernel/decorators/Schema';

export abstract class Controller<
  TAccess extends Controller.Access = 'public',
  TResponseBody = undefined,
> {
  protected abstract handle(
    request: Controller.Request<TAccess>,
  ): Promise<Controller.Response<TResponseBody>>;

  public async execute(
    request: Controller.Request<TAccess>,
  ): Promise<Controller.Response<TResponseBody>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body: body as Record<string, unknown>,
    });
  }

  private validateBody(body: Record<string, unknown>): unknown {
    const schema = getSchema(this);
    if (!schema) { return body; }
    return schema.parse(body);
  }
}

export namespace Controller {
  export type Access = 'public' | 'private';

  export type Request<TAccess extends Access = 'public'> = {
    body: Record<string, unknown>;
    params: Record<string, string | undefined>;
    queryParams: Record<string, string | undefined>;
    accountId: TAccess extends 'private' ? string : null;
  };

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };
}
