import { Controller } from '@application/contracts/Controller';
import { ProcessWhatsAppMessageUseCase } from '@application/useCases/messaging/ProcessWhatsAppMessageUseCase';
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
    private readonly processWhatsAppMessage: ProcessWhatsAppMessageUseCase,
  ) {
    super();
  }

  protected async handle(
    request: Controller.Request<'webhook', WhatsAppWebhookBody>,
  ): Promise<Controller.Response> {
    const { whatsAppId, body } = request;

    // O Controller age apenas como tradutor e delegador,
    //Vamos colocaríamos na fila aqui.
    await this.processWhatsAppMessage.execute({
      whatsAppId: whatsAppId ?? '',
      message: body,
    });

    return { statusCode: 200 };
  }
}
