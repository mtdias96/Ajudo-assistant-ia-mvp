import { MessageTooLongError } from '@application/errors/application/MessageTooLongError';
import { AiService } from '@application/services/AiService';
import { GENERAL_CHAT_PROMPT } from '@application/services/prompts/generalChat';
import { AnalyzeNutrition } from '@application/useCases/AnalyzeNutrition';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class HandleIncomingMessage {
  private static readonly MAX_MESSAGE_LENGTH = 2000;

  constructor(
    private readonly aiService: AiService,
    private readonly analyzeNutrition: AnalyzeNutrition,
  ) {}

  async execute(text: string): Promise<string> {
    if (text.length > HandleIncomingMessage.MAX_MESSAGE_LENGTH) {
      throw new MessageTooLongError(HandleIncomingMessage.MAX_MESSAGE_LENGTH);
    }

    const extracted = await this.aiService.extractIntent(text);

    switch (extracted.intent) {
      case 'nutrition':
        return this.analyzeNutrition.execute(extracted);
      case 'unknown':
        return this.aiService.generateResponse(
          GENERAL_CHAT_PROMPT,
          extracted.message,
        );
    }
  }
}
