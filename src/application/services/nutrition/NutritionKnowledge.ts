export type NutritionKnowledge = {
  id: number;
  description: string;
  category: string;
  per100g: NutritionKnowledge.Macros;
};

export namespace NutritionKnowledge {
  export type Macros = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
