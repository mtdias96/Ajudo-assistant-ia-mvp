import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { ProfileRepository } from '@infrastructure/database/dynamo/repositories/ProfileRepository';
import { WhatsAppGateway } from '@infrastructure/gateways/WhatsAppGateway';
import { Injectable } from '@kernel/decorators/Injectable';

import { IdentifyWhatsAppAccountUseCase } from '../account/IdentifyWhatsAppAccountUseCase';
import { ResolvePendingMealUseCase } from '../nutrition/ResolvePendingMealUseCase';
import { CollectProfileDataUseCase } from '../profile/CollectProfileDataUseCase';
import { ExtractMessageIntentUseCase } from './ExtractMessageIntentUseCase';
import { HandleIncomingMessageUseCase } from './HandleIncomingMessageUseCase';

@Injectable()
export class ProcessWhatsAppMessageUseCase {
  constructor(
    private readonly identifyWhatsAppAccount: IdentifyWhatsAppAccountUseCase,
    private readonly handleIncomingMessage: HandleIncomingMessageUseCase,
    private readonly extractMessageIntent: ExtractMessageIntentUseCase,
    private readonly collectProfileData: CollectProfileDataUseCase,
    private readonly resolvePendingMeal: ResolvePendingMealUseCase,
    private readonly profileRepository: ProfileRepository,
    private readonly mealRepository: MealRepository,
    private readonly whatsApp: WhatsAppGateway,
  ) { }

  async execute(input: ProcessWhatsAppMessageUseCase.Input): Promise<void> {
    const { whatsAppId, message } = input;

    if (!whatsAppId) { return; }

    const mediaCount = Number(message.NumMedia ?? '0');

    if (mediaCount === 0 && !message.Body) {
      return;
    }

    const account = await this.identifyWhatsAppAccount.execute(whatsAppId);
    const profile = await this.profileRepository.findByAccountId(account.id);

    if (!profile || !profile.isComplete()) {
      const reply = await this.collectProfileData.execute({
        accountId: account.id,
        message: message.Body ?? '',
      });

      await this.whatsApp.sendText({ to: whatsAppId, text: reply });
      return;
    }

    const pending = await this.mealRepository.findPending(account.id);

    if (pending && message.Body && mediaCount === 0) {
      const reply = await this.resolvePendingMeal.execute({
        pending,
        profile,
        message: message.Body,
      });

      await this.whatsApp.sendText({ to: whatsAppId, text: reply });
      return;
    }

    const extractionResult = await this.extractMessageIntent.execute({
      mediaCount,
      mediaUrl: message.MediaUrl0,
      contentType: message.MediaContentType0,
      body: message.Body,
    });

    const reply = await this.handleIncomingMessage.execute({
      extracted: extractionResult.intent,
      inputType: extractionResult.inputType,
      profile,
    });

    await this.whatsApp.sendText({ to: whatsAppId, text: reply });
  }
}

export namespace ProcessWhatsAppMessageUseCase {
  export type Input = {
    whatsAppId: string;
    message: {
      NumMedia?: string;
      Body?: string;
      MediaUrl0?: string;
      MediaContentType0?: string;
    };
  };
}
