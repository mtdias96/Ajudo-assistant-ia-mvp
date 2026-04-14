import { Meal } from '@application/entities/Meal';

import { NutritionItem, NutritionTotal } from './NutritionResult';

export type NutritionIntent = {
  intent: 'nutrition';
  items: NutritionItem[];
  total: NutritionTotal;
  category?: Meal.Category;
};

export type UnknownIntent = {
  intent: 'unknown';
  message: string;
};

export type SummaryIntent = {
  intent: 'summary';
  message: string;
};

export type EditLastMealIntent = {
  intent: 'edit_last_meal';
  message: string;
};

export type ExtractedIntent =
  | NutritionIntent
  | SummaryIntent
  | UnknownIntent
  | EditLastMealIntent;
