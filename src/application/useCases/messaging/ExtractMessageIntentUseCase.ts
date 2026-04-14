import { InvalidMediaCountError } from '@application/errors/application/InvalidMediaCountError';
import { UnsupportedMediaTypeError } from '@application/errors/application/UnsupportedMediaTypeError';
import { AiService } from '@application/services/AiService';
import { ExtractedIntent } from '@application/services/types/ExtractedIntent';
import { Meal } from '@application/entities/Meal';
import { WhatsAppGateway } from '@infrastructure/gateways/WhatsAppGateway';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class ExtractMessageIntentUseCase {
  private static readonly SUPPORTED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]);

  constructor(
    private readonly aiService: AiService,
    private readonly whatsApp: WhatsAppGateway,
  ) {}

  async execute({ mediaCount, mediaUrl, contentType, body }: ExtractMessageIntentUseCase.Input): Promise<ExtractMessageIntentUseCase.Result> {
    if (mediaCount > 0 && mediaUrl && contentType) {
      if (mediaCount !== 1) {
        throw new InvalidMediaCountError();
      }

      const normalizedType = contentType.toLowerCase();
      if (!ExtractMessageIntentUseCase.SUPPORTED_MIME_TYPES.has(normalizedType)) {
        throw new UnsupportedMediaTypeError(contentType);
      }

      const media = await this.whatsApp.fetchMedia(mediaUrl);

      const result = await this.aiService.analyzeNutritionImage({
        mimeType: normalizedType,
        base64: media.buffer.toString('base64'),
      });

      return {
        intent: {
          intent: 'nutrition',
          items: result.items,
          total: result.total,
        },
        inputType: Meal.InputType.IMAGE,
      };
    }

    if (body) {
      const intent = await this.aiService.extractIntent(body);
      return {
        intent,
        inputType: Meal.InputType.TEXT,
      };
    }

    return {
      intent: { intent: 'unknown', message: '' },
      inputType: Meal.InputType.TEXT,
    };
  }
}

export namespace ExtractMessageIntentUseCase {
  export type Input = {
    mediaCount: number;
    mediaUrl?: string;
    contentType?: string;
    body?: string;
  };

  export type Result = {
    intent: ExtractedIntent;
    inputType: Meal.InputType;
  };
}
