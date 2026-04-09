import { Controller } from '@application/contracts/Controller';
import { WhatsAppGateway } from '@infrastructure/gateways/WhatsAppGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import {
  SendWhatsAppMessageBody,
  SendWhatsAppMessageBodySchema,
} from './schemas/SendWhatsAppMessageBody';

@Injectable()
@Schema(SendWhatsAppMessageBodySchema)
export class SendWhatsAppMessageController extends Controller<'public', { ok: true }> {
  constructor(private readonly whatsapp: WhatsAppGateway) {
    super();
  }

  protected async handle(
    request: Controller.Request<'public'>,
  ): Promise<Controller.Response<{ ok: true }>> {
    const { to, text } = request.body as unknown as SendWhatsAppMessageBody;

    await this.whatsapp.sendText({ to, text });

    return { statusCode: 200, body: { ok: true } };
  }
}
