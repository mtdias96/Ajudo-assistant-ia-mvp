import { Controller } from '@application/contracts/Controller';
import { HandleIncomingMessage } from '@application/useCases/HandleIncomingMessage';
import { IdentifyWhatsAppAccount } from '@application/useCases/IdentifyWhatsAppAccount';
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
    private readonly identifyWhatsAppAccount: IdentifyWhatsAppAccount,
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
      return { statusCode: 200 };
    }

    await this.identifyWhatsAppAccount.execute(whatsAppId);

    const reply = await this.handleIncomingMessage.execute(message.Body);
    await this.whatsApp.sendText({ to: whatsAppId, text: reply });

    return { statusCode: 200 };
  }
}
