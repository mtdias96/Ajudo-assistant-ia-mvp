import { InvalidMediaCountError } from '@application/errors/application/InvalidMediaCountError';
import { UnsupportedMediaTypeError } from '@application/errors/application/UnsupportedMediaTypeError';
import { AiService } from '@application/services/AiService';
import { WhatsAppGateway } from '@infrastructure/gateways/WhatsAppGateway';
import { Injectable } from '@kernel/decorators/Injectable';
import { AnalyzeNutrition } from './AnalyzeNutrition';

@Injectable()
export class AnalyzeNutritionImage {
  private static readonly SUPPORTED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ]);

  constructor(
    private readonly aiService: AiService,
    private readonly analyzeNutrition: AnalyzeNutrition,
    private readonly whatsApp: WhatsAppGateway,
  ) {}

  async execute({
    count,
    mediaUrl,
    contentType,
  }: AnalyzeNutritionImage.Input): Promise<string> {
    if (count !== 1 || !mediaUrl || !contentType) {
      throw new InvalidMediaCountError();
    }

    const normalizedType = contentType.toLowerCase();

    if (!AnalyzeNutritionImage.SUPPORTED_MIME_TYPES.has(normalizedType)) {
      throw new UnsupportedMediaTypeError(contentType);
    }

    const media = await this.whatsApp.fetchMedia(mediaUrl);

    const result = await this.aiService.analyzeNutritionImage({
      mimeType: normalizedType,
      base64: media.buffer.toString('base64'),
    });

    return this.analyzeNutrition.execute({
      intent: 'nutrition',
      items: result.items,
      total: result.total,
    });
  }
}

export namespace AnalyzeNutritionImage {
  export type Input = {
    count: number;
    mediaUrl?: string;
    contentType?: string;
  };
}
