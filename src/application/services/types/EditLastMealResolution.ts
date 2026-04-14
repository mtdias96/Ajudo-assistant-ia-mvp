import { NutritionItem, NutritionTotal } from './NutritionResult';

export type UpdateMealResolution = {
  action: 'update';
  items: NutritionItem[];
  total: NutritionTotal;
};

export type DeleteMealResolution = {
  action: 'delete';
};

export type NoneMealResolution = {
  action: 'none';
};

export type EditLastMealResolution =
  | UpdateMealResolution
  | DeleteMealResolution
  | NoneMealResolution;
