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

export enum EditMealOperation {
  DELETE_MEAL = 'DELETE_MEAL',
  DELETE_FOOD = 'DELETE_FOOD',
  UPDATE_FOOD = 'UPDATE_FOOD',
  SWAP_FOOD = 'SWAP_FOOD',
  MOVE_MEAL = 'MOVE_MEAL',
}

export type EditMealTarget = {
  category: Meal.Category | null;
  mealIndex: number | null;
  foodName: string | null;
};

export type EditMealIntent = {
  intent: 'edit_meal';
  operation: EditMealOperation;
  target: EditMealTarget;
  change: NutritionItem | null;
  destinationCategory: Meal.Category | null;
  message: string;
};

export type ExtractedIntent =
  | NutritionIntent
  | SummaryIntent
  | UnknownIntent
  | EditMealIntent;
