import { AiParseError } from '@application/errors/application/AiParseError';
import { AiGateway } from '@infrastructure/gateways/ai/AiGateway';
import { ESTIMATE_NUTRITION_BATCH_SCHEMA, EXTRACT_INTENT_SCHEMA, NUTRITION_RESULT_SCHEMA, ONBOARDING_RESULT_SCHEMA } from '@infrastructure/gateways/ai/schemas/AiSchemas';
import { Injectable } from '@kernel/decorators/Injectable';

import { ESTIMATE_NUTRITION_BATCH_PROMPT } from '@infrastructure/gateways/ai/prompts/estimateNutritionBatch';
import { EXTRACT_INTENT_PROMPT } from '@infrastructure/gateways/ai/prompts/extractIntent';
import { NUTRITION_IMAGE_PROMPT } from '@infrastructure/gateways/ai/prompts/nutritionPrompt';
import { ONBOARDING_PROMPT } from '@infrastructure/gateways/ai/prompts/onboardingPrompt';
import { RERANK_NUTRITION_MATCH_PROMPT } from '@infrastructure/gateways/ai/prompts/rerankNutritionMatch';
import { RESOLVE_PENDING_MEAL_PROMPT } from '@infrastructure/gateways/ai/prompts/resolvePendingMeal';
import { ExtractedIntent } from './types/ExtractedIntent';
import { INTENT_MODEL_MAP, MODEL_TIERS, ModelTier } from './types/ModelTier';
import { NutritionResult } from './types/NutritionResult';
import type { OnboardingResult } from './types/OnboardingResult';
import { PendingResolutionIntent } from './types/PendingResolutionIntent';

@Injectable()
export class AiService {
  constructor(private readonly ai: AiGateway) {}

  async extractIntent(message: string): Promise<ExtractedIntent> {
    const config = this.resolveModel('extraction');

    const result = await this.ai.chat({
      ...config,
      responseSchema: EXTRACT_INTENT_SCHEMA,
      messages: [
        { role: 'system', content: EXTRACT_INTENT_PROMPT },
        { role: 'user', content: message },
      ],
    });

    return JSON.parse(result.content) as ExtractedIntent;
  }

  async analyzeNutritionImage(
    image: AiService.NutritionImageInput,
  ): Promise<NutritionResult> {
    const config = this.resolveModel('nutrition_visual');

    const result = await this.ai.analyzeImage({
      ...config,
      responseSchema: NUTRITION_RESULT_SCHEMA,
      systemPrompt: NUTRITION_IMAGE_PROMPT,
      image,
    });

    return JSON.parse(result.content) as NutritionResult;
  }

  async resolvePendingMeal(
    input: AiService.ResolvePendingMealInput,
  ): Promise<PendingResolutionIntent> {
    const config = this.resolveModel('nutrition');
    const systemPrompt = RESOLVE_PENDING_MEAL_PROMPT.replace(
      '{{pending}}',
      JSON.stringify(input.pending),
    );

    const result = await this.ai.chat({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.message },
      ],
    });

    return this.parseJson<PendingResolutionIntent>(result.content);
  }

  async estimateNutritionBatch(
    input: AiService.EstimateNutritionBatchInput,
  ): Promise<AiService.EstimateNutritionBatchResult> {
    if (input.items.length === 0) {
      return { results: [] };
    }

    const config = this.resolveModel('nutrition_estimation');

    const itemsBlock = input.items.map(item => {
      const group = item.foodGroup ? ` | grupo="${item.foodGroup}"` : '';
      return `- itemId="${item.itemId}" | alimento="${item.name}" | gramas=${item.grams}${group}`;
    }).join('\n');

    const result = await this.ai.chat({
      ...config,
      responseSchema: ESTIMATE_NUTRITION_BATCH_SCHEMA,
      messages: [
        { role: 'system', content: ESTIMATE_NUTRITION_BATCH_PROMPT },
        { role: 'user', content: `Itens:\n${itemsBlock}` },
      ],
    });

    return this.parseJson<AiService.EstimateNutritionBatchResult>(result.content);
  }

  async rerankNutritionMatchBatch(
    input: AiService.RerankNutritionMatchBatchInput,
  ): Promise<AiService.RerankNutritionMatchBatchResult> {
    if (input.items.length === 0) {
      return { results: [] };
    }

    const config = this.resolveModel('reranking');

    const itemsBlock = input.items.map(item => {
      const candidates = item.candidates
        .map(c => `  - id=${c.id} | ${c.description} | ${c.category}`)
        .join('\n');

      return `- itemId="${item.itemId}" | alimento="${item.query}" | quantidade="${item.quantity}"\n${candidates}`;
    }).join('\n');

    const userMessage = `Itens:\n${itemsBlock}`;

    const result = await this.ai.chat({
      ...config,
      messages: [
        { role: 'system', content: RERANK_NUTRITION_MATCH_PROMPT },
        { role: 'user', content: userMessage },
      ],
    });

    return this.parseJson<AiService.RerankNutritionMatchBatchResult>(result.content);
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
      responseSchema: ONBOARDING_RESULT_SCHEMA,
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

  export type PendingMealSnapshot = {
    name: string;
    items: {
      name: string;
      quantity: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }[];
  };

  export type ResolvePendingMealInput = {
    pending: PendingMealSnapshot;
    message: string;
  };

  export type RerankNutritionMatchCandidate = {
    id: number;
    description: string;
    category: string;
  };

  export type RerankNutritionMatchItem = {
    itemId: string;
    query: string;
    quantity: string;
    candidates: RerankNutritionMatchCandidate[];
  };

  export type RerankNutritionMatchBatchInput = {
    items: RerankNutritionMatchItem[];
  };

  export type RerankNutritionMatchBatchResult = {
    results: Array<{ itemId: string; id: number | null }>;
  };

  export type EstimateNutritionBatchItem = {
    itemId: string;
    name: string;
    grams: number;
    foodGroup?: string;
  };

  export type EstimateNutritionBatchInput = {
    items: EstimateNutritionBatchItem[];
  };

  export type EstimateNutritionBatchEntry = {
    itemId: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };

  export type EstimateNutritionBatchResult = {
    results: EstimateNutritionBatchEntry[];
  };
}
