import { Controller } from '@application/contracts/Controller';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import {
  WhatsAppWebhookBody,
  WhatsAppWebhookBodySchema,
} from './schemas/WhatsAppWebhookBody';

@Injectable()
@Schema(WhatsAppWebhookBodySchema)
export class WhatsAppWebhookController extends Controller<'public'> {
  protected async handle(
    request: Controller.Request<'public'>,
  ): Promise<Controller.Response> {
    const message = request.body as unknown as WhatsAppWebhookBody;

    // eslint-disable-next-line no-console
    console.log('[WhatsAppWebhook] raw payload', JSON.stringify(message, null, 2));

    await this.processMessage(message);

    return { statusCode: 200 };
  }

  private async processMessage(_message: WhatsAppWebhookBody): Promise<void> {
    // TODO: despachar para o use case HandleIncomingMessage.
  }
}
