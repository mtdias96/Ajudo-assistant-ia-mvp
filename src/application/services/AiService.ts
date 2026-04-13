import { AiParseError } from '@application/errors/application/AiParseError';
import { AiGateway } from '@infrastructure/gateways/AiGateway';
import { Injectable } from '@kernel/decorators/Injectable';

import { EXTRACT_INTENT_PROMPT } from './prompts/extractIntent';
import { NUTRITION_IMAGE_PROMPT } from './prompts/nutritionPrompt';
import { ONBOARDING_PROMPT } from './prompts/onboardingPrompt';
import { ExtractedIntent } from './types/ExtractedIntent';
import { INTENT_MODEL_MAP, MODEL_TIERS, ModelTier } from './types/ModelTier';
import { NutritionResult } from './types/NutritionResult';
import type { OnboardingResult } from './types/OnboardingResult';

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

  async analyzeNutritionImage(
    image: AiService.NutritionImageInput,
  ): Promise<NutritionResult> {
    const config = this.resolveModel('nutrition');

    const result = await this.ai.analyzeImage({
      ...config,
      systemPrompt: NUTRITION_IMAGE_PROMPT,
      image,
    });

    return this.parseJson<NutritionResult>(result.content);
  }

  async collectProfileData(
    message: string,
    collected: Record<string, unknown>,
  ): Promise<OnboardingResult> {
    const config = this.resolveModel('standard');
    const systemPrompt = ONBOARDING_PROMPT.replace(
      '{{collected}}',
      JSON.stringify(collected),
    );

    const result = await this.ai.chat({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    return this.parseJson<OnboardingResult>(result.content);
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

export namespace AiService {
  export type NutritionImageInput = {
    mimeType: string;
    base64: string;
  };
}
