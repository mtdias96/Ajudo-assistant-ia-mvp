import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class HelloController extends Controller<'public', { message: string }> {
  protected async handle(_request: Controller.Request<'public'>): Promise<Controller.Response<{ message: string }>> {
    return {
      statusCode: 200,
      body: { message: 'Hello handler successfully' },
    };
  }
}
