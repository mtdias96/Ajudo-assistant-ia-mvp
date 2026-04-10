import { AiParseError } from '@application/errors/application/AiParseError';
import { AiGateway } from '@infrastructure/gateways/AiGateway';
import { Injectable } from '@kernel/decorators/Injectable';

import { EXTRACT_INTENT_PROMPT } from './prompts/extractIntent';
import { ExtractedIntent } from './types/ExtractedIntent';
import { INTENT_MODEL_MAP, MODEL_TIERS, ModelTier } from './types/ModelTier';

@Injectable()
export class AiService {
  constructor(private readonly ai: AiGateway) {}

  async extractIntent(message: string): Promise<ExtractedIntent> {
    const config = this.resolveModel('extraction');

    const result = await this.ai.chat({
      ...config,
      messages: [
        { role: 'system', content: EXTRACT_INTENT_PROMPT },
        { role: 'user', content: message },
      ],
    });

    return this.parseJson<ExtractedIntent>(result.content);
  }

  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    intentOrTier: string = 'standard',
  ): Promise<string> {
    const config = this.resolveModel(intentOrTier);

    const result = await this.ai.chat({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return this.sanitizeResponse(result.content);
  }

  private resolveModel(intentOrTier: string) {
    const tier = (INTENT_MODEL_MAP[intentOrTier] ?? intentOrTier) as ModelTier;
    return MODEL_TIERS[tier] ?? MODEL_TIERS.lite;
  }

  private parseJson<T>(raw: string): T {
    const sanitized = this.sanitizeResponse(raw);

    try {
      return JSON.parse(sanitized) as T;
    } catch {
      throw new AiParseError(sanitized);
    }
  }

  private sanitizeResponse(raw: string): string {
    return raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  }
}
