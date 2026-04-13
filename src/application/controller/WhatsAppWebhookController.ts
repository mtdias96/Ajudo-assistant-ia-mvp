import { Controller } from '@application/contracts/Controller';
import { AnalyzeNutritionImage } from '@application/useCases/AnalyzeNutritionImage';
import { CollectProfileData } from '@application/useCases/CollectProfileData';
import { HandleIncomingMessage } from '@application/useCases/HandleIncomingMessage';
import { IdentifyWhatsAppAccount } from '@application/useCases/IdentifyWhatsAppAccount';
import { ProfileRepository } from '@infrastructure/database/dynamo/repositories/ProfileRepository';
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
    private readonly analyzeNutritionImage: AnalyzeNutritionImage,
    private readonly collectProfileData: CollectProfileData,
    private readonly profileRepository: ProfileRepository,
    private readonly whatsApp: WhatsAppGateway,
  ) {
    super();
  }

  protected async handle(
    request: Controller.Request<'webhook', WhatsAppWebhookBody>,
  ): Promise<Controller.Response> {
    const { whatsAppId } = request;
    const message = request.body;

    if (!whatsAppId) {
      return { statusCode: 200 };
    }

    const mediaCount = Number(message.NumMedia ?? '0');

    if (mediaCount === 0 && !message.Body) {
      return { statusCode: 200 };
    }

    const account = await this.identifyWhatsAppAccount.execute(whatsAppId);

    const profile = await this.profileRepository.findByAccountId(account.id);

    if (!profile || !profile.isComplete()) {
      const reply = await this.collectProfileData.execute({
        accountId: account.id,
        message: message.Body ?? '',
      });

      await this.whatsApp.sendText({ to: whatsAppId, text: reply });
      return { statusCode: 200 };
    }

    const reply =
      mediaCount > 0
        ? await this.analyzeNutritionImage.execute({
            count: mediaCount,
            mediaUrl: message.MediaUrl0,
            contentType: message.MediaContentType0,
          })
        : await this.handleIncomingMessage.execute(message.Body!);

    await this.whatsApp.sendText({ to: whatsAppId, text: reply });

    return { statusCode: 200 };
  }
}
