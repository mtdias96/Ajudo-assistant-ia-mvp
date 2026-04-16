import { Meal } from '@application/entities/Meal';
import { AiService } from '@application/services/AiService';
import { NutritionItem } from '@application/services/types/NutritionResult';
import { NutritionKnowledgeRepository } from '@infrastructure/database/qdrant/repositories/NutritionKnowledgeRepository';
import { Injectable } from '@kernel/decorators/Injectable';

import { NutritionGuardrails } from './NutritionGuardrails';
import { NutritionKnowledge } from './NutritionKnowledge';

@Injectable()
export class NutritionEnricher {
  private static readonly HIGH_CONFIDENCE = 0.78;
  private static readonly LOW_CONFIDENCE = 0.65;
  private static readonly SEARCH_LIMIT = 3;
  private static readonly QUANTITY_REGEX = /(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i;

  constructor(
    private readonly nutritionKnowledgeRepository: NutritionKnowledgeRepository,
    private readonly aiService: AiService,
    private readonly nutritionGuardrails: NutritionGuardrails,
  ) { }

  async enrich(items: NutritionItem[]): Promise<Meal.Food[]> {
    const gramsByIndex = items.map(item => this.resolveGrams(item));
    const searchable = items
      .map((item, index) => ({ item, index }))
      .filter(({ index }) => gramsByIndex[index] !== null);

    const matchesList = searchable.length === 0
      ? []
      : await this.nutritionKnowledgeRepository.searchByNames({
        queries: searchable.map(({ item }) => this.buildSearchQuery(item)),
        limit: NutritionEnricher.SEARCH_LIMIT,
      });

    const matchesByIndex = new Map<number, NutritionKnowledgeRepository.SearchMatch[]>();
    searchable.forEach(({ index }, i) => matchesByIndex.set(index, matchesList[i] ?? []));

    const chosenByIndex = await this.resolveChoices(items, matchesByIndex);

    return items.map((item, index) => {
      const grams = gramsByIndex[index];
      if (grams === null) {
        return this.toEstimated(item);
      }

      const chosen = chosenByIndex.get(index);
      if (!chosen) {
        return this.toEstimated(item, grams);
      }

      return this.toTacoFood(item, grams, chosen);
    });
  }

  private async resolveChoices(
    items: NutritionItem[],
    matchesByIndex: Map<number, NutritionKnowledgeRepository.SearchMatch[]>,
  ): Promise<Map<number, NutritionKnowledge>> {
    const chosen = new Map<number, NutritionKnowledge>();
    const toRerank: Array<{ index: number; item: NutritionItem; matches: NutritionKnowledgeRepository.SearchMatch[] }> = [];

    matchesByIndex.forEach((matches, index) => {
      const top1 = matches[0];
      if (!top1 || top1.score < NutritionEnricher.LOW_CONFIDENCE) {
        return;
      }

      if (top1.score >= NutritionEnricher.HIGH_CONFIDENCE) {
        chosen.set(index, top1.knowledge);
        return;
      }

      toRerank.push({ index, item: items[index], matches });
    });

    if (toRerank.length === 0) {
      return chosen;
    }

    const { results } = await this.aiService.rerankNutritionMatchBatch({
      items: toRerank.map(({ index, item, matches }) => ({
        itemId: String(index),
        query: item.name,
        quantity: item.quantity,
        candidates: matches.map(match => ({
          id: match.knowledge.id,
          description: match.knowledge.description,
          category: match.knowledge.category,
        })),
      })),
    });

    const matchesById = new Map(toRerank.map(entry => [String(entry.index), entry.matches]));
    for (const { itemId, id } of results) {
      if (id === null) {
        continue;
      }

      const matches = matchesById.get(itemId);
      const knowledge = matches?.find(match => match.knowledge.id === id)?.knowledge;
      if (knowledge) {
        chosen.set(Number(itemId), knowledge);
      }
    }

    return chosen;
  }

  private buildSearchQuery(item: NutritionItem): string {
    if (item.foodGroup) {
      return `${item.name} (${item.foodGroup})`;
    }

    return item.name;
  }

  private toTacoFood(item: NutritionItem, grams: number, knowledge: NutritionKnowledge): Meal.Food {
    const factor = grams / 100;
    const { per100g } = knowledge;

    return {
      name: item.name,
      quantity: item.quantity,
      quantityGrams: grams,
      source: Meal.FoodSource.TACO,
      calories: Math.round(per100g.calories * factor),
      protein: Math.round(per100g.protein * factor),
      carbs: Math.round(per100g.carbs * factor),
      fat: Math.round(per100g.fat * factor),
      fiber: Math.round(per100g.fiber * factor),
    };
  }

  private resolveGrams(item: NutritionItem): number | null {
    const parsed = this.parseGramsFromString(item.quantity);
    if (parsed !== null) {
      return parsed;
    }

    if (typeof item.quantityGrams === 'number' && item.quantityGrams > 0) {
      return Math.round(item.quantityGrams);
    }

    return null;
  }

  private parseGramsFromString(quantity: string): number | null {
    const match = NutritionEnricher.QUANTITY_REGEX.exec(quantity);
    if (!match) {
      return null;
    }

    const value = Number(match[1].replace(',', '.'));
    if (!Number.isFinite(value)) {
      return null;
    }

    const unit = match[2].toLowerCase();
    const grams = unit === 'kg' ? value * 1000 : value;

    return Math.round(grams);
  }

  private toEstimated(item: NutritionItem, grams: number | null = null): Meal.Food {
    const macros = this.nutritionGuardrails.sanitize(item, grams);

    return {
      name: item.name,
      quantity: item.quantity,
      ...(grams !== null && { quantityGrams: grams }),
      source: Meal.FoodSource.ESTIMATED,
      ...macros,
    };
  }
}
