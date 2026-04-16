import { NutritionKnowledge } from '@application/services/nutrition/NutritionKnowledge';

export class NutritionPoint {
  static buildEmbeddingText(entry: NutritionKnowledge): string {
    return `${entry.description} (${entry.category})`;
  }

  static toPayload(entry: NutritionKnowledge): NutritionPoint.Payload {
    return {
      id: entry.id,
      description: entry.description,
      category: entry.category,
      per100g: entry.per100g,
    };
  }

  static toEntity(payload: NutritionPoint.Payload): NutritionKnowledge {
    return {
      id: payload.id,
      description: payload.description,
      category: payload.category,
      per100g: payload.per100g,
    };
  }
}

export namespace NutritionPoint {
  export type Payload = {
    id: number;
    description: string;
    category: string;
    per100g: NutritionKnowledge.Macros;
  } & Record<string, unknown>;
}
