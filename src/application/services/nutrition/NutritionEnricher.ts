import { Meal } from '@application/entities/Meal';
import { AiService } from '@application/services/AiService';
import { NutritionItem } from '@application/services/types/NutritionResult';
import { NutritionKnowledgeRepository } from '@infrastructure/database/qdrant/repositories/NutritionKnowledgeRepository';
import { Injectable } from '@kernel/decorators/Injectable';

import { NutritionGuardrails } from './NutritionGuardrails';
import type { NutritionKnowledge } from './NutritionKnowledge';

@Injectable()
export class NutritionEnricher {
  private static readonly HIGH_CONFIDENCE = 0.78;
  private static readonly LOW_CONFIDENCE = 0.55;
  private static readonly SEARCH_LIMIT = 3;
  private static readonly QUANTITY_REGEX = /(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i;
  private static readonly PORTION_REGEX = /(\d+(?:[.,]\d+)?)\s*(.+)/i;
  private static readonly PORTION_MAP: Record<string, number> = {
    'concha': 80,
    'conchas': 80,
    'colher de sopa': 15,
    'colheres de sopa': 15,
    'colher': 15,
    'colheres': 15,
    'colher de chá': 5,
    'colheres de chá': 5,
    'colher de sobremesa': 10,
    'colheres de sobremesa': 10,
    'xícara': 200,
    'xícaras': 200,
    'copo': 200,
    'copos': 200,
    'fatia': 30,
    'fatias': 30,
    'unidade': 50,
    'unidades': 50,
    'pedaço': 80,
    'pedaços': 80,
    'prato': 250,
    'pratos': 250,
    'escumadeira': 80,
    'escumadeiras': 80,
    'pegador': 45,
    'pegadores': 45,
  };

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
    const estimatedByIndex = await this.estimateMisses(items, gramsByIndex, chosenByIndex);

    return items.map((item, index) => {
      const grams = gramsByIndex[index];
      if (grams === null) {
        return this.toEstimated(item);
      }

      const chosen = chosenByIndex.get(index);
      if (chosen) {
        return this.toTacoFood(item, grams, chosen);
      }

      const estimated = estimatedByIndex.get(index);
      if (estimated) {
        return this.toAiEstimated(item, grams, estimated);
      }

      return this.toEstimated(item, grams);
    });
  }

  private async estimateMisses(
    items: NutritionItem[],
    gramsByIndex: (number | null)[],
    chosenByIndex: Map<number, NutritionKnowledge>,
  ): Promise<Map<number, AiService.EstimateNutritionBatchEntry>> {
    const missing: AiService.EstimateNutritionBatchItem[] = [];

    items.forEach((item, index) => {
      const grams = gramsByIndex[index];
      if (grams === null || chosenByIndex.has(index)) {
        return;
      }

      missing.push({
        itemId: String(index),
        name: item.name,
        grams,
        foodGroup: item.foodGroup,
      });
    });

    if (missing.length === 0) {
      return new Map();
    }

    const { results } = await this.aiService.estimateNutritionBatch({ items: missing });

    return new Map(results.map(entry => [Number(entry.itemId), entry]));
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
      quantity: `${grams}g`,
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

    const portion = this.parsePortionFromString(item.quantity);
    if (portion !== null) {
      return portion;
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

  private parsePortionFromString(quantity: string): number | null {
    const normalized = quantity.toLowerCase().trim();
    const match = NutritionEnricher.PORTION_REGEX.exec(normalized);

    if (match) {
      const count = Number(match[1].replace(',', '.'));
      const unit = match[2].trim();

      if (Number.isFinite(count) && count > 0) {
        const gramsPerUnit = NutritionEnricher.PORTION_MAP[unit];
        if (gramsPerUnit !== undefined) {
          return Math.round(count * gramsPerUnit);
        }
      }
    }

    const sortedEntries = Object.entries(NutritionEnricher.PORTION_MAP)
      .sort(([a], [b]) => b.length - a.length);

    for (const [portion, grams] of sortedEntries) {
      if (normalized.includes(portion)) {
        return grams;
      }
    }

    return null;
  }

  private toEstimated(item: NutritionItem, grams: number | null = null): Meal.Food {
    const macros = this.nutritionGuardrails.sanitize(item, grams);

    return {
      name: item.name,
      quantity: grams !== null ? `${grams}g` : item.quantity,
      ...(grams !== null && { quantityGrams: grams }),
      source: Meal.FoodSource.ESTIMATED,
      ...macros,
    };
  }

  private toAiEstimated(
    item: NutritionItem,
    grams: number,
    estimated: AiService.EstimateNutritionBatchEntry,
  ): Meal.Food {
    const macros = this.nutritionGuardrails.sanitize(
      {
        ...item,
        calories: estimated.calories,
        protein: estimated.protein,
        carbs: estimated.carbs,
        fat: estimated.fat,
        fiber: estimated.fiber,
      },
      grams,
    );

    return {
      name: item.name,
      quantity: `${grams}g`,
      quantityGrams: grams,
      source: Meal.FoodSource.ESTIMATED,
      ...macros,
    };
  }
}
