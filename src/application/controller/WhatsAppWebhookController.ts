import { Controller } from '@application/contracts/Controller';
import { ApplicationError } from '@application/errors/application/ApplicationError';
import { HandleIncomingMessage } from '@application/useCases/HandleIncomingMessage';
import { WhatsAppGateway } from '@infrastructure/gateways/WhatsAppGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import {
  WhatsAppWebhookBody,
  WhatsAppWebhookBodySchema,
} from './schemas/WhatsAppWebhookBody';

@Injectable()
@Schema(WhatsAppWebhookBodySchema)
export class WhatsAppWebhookController extends Controller<'webhook'> {
  constructor(
    private readonly handleIncomingMessage: HandleIncomingMessage,
    private readonly whatsApp: WhatsAppGateway,
  ) {
    super();
  }

  protected async handle(
    request: Controller.Request<'webhook', WhatsAppWebhookBody>,
  ): Promise<Controller.Response> {
    const { whatsAppId } = request;
    const message = request.body;

    if (!message.Body || !whatsAppId) {
      // eslint-disable-next-line no-console
      console.log('[WhatsAppWebhook] missing data from', whatsAppId);
      return { statusCode: 200 };
    }

    try {
      const reply = await this.handleIncomingMessage.execute(message.Body);
      await this.whatsApp.sendText({ to: whatsAppId, text: reply });
    } catch (error) {
      if (error instanceof ApplicationError) {
        await this.whatsApp.sendText({ to: whatsAppId, text: error.message });
      } else {
        // eslint-disable-next-line no-console
        console.error('[WhatsAppWebhook] unhandled error', error);
      }
    }

    return { statusCode: 200 };
  }
}
