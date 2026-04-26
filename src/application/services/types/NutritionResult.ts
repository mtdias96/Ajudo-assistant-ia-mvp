export type NutritionItem = {
  name: string;
  quantity: string;
  quantityGrams: number | null;
  foodGroup?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
};

export type NutritionTotal = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type NutritionResult = {
  items: NutritionItem[];
};
