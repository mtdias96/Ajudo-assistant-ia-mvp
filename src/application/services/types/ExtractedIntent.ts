import { NutritionItem, NutritionTotal } from './NutritionResult';

export type NutritionIntent = {
  intent: 'nutrition';
  items: NutritionItem[];
  total: NutritionTotal;
};

export type UnknownIntent = {
  intent: 'unknown';
  message: string;
};

export type ExtractedIntent = NutritionIntent | UnknownIntent;
