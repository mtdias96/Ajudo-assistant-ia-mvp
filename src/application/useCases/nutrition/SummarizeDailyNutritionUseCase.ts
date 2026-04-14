import { Meal } from '@application/entities/Meal';
import { CompleteProfile } from '@application/entities/Profile';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';
import { DateUtils } from '@shared/utils/DateUtils';
import { NutritionFormatter } from '@application/services/formatters/NutritionFormatter';

@Injectable()
export class SummarizeDailyNutritionUseCase {

  constructor(
    private readonly mealRepository: MealRepository,
    private readonly goalCalculator: GoalCalculator,
    private readonly nutritionFormatter: NutritionFormatter,
  ) { }

  async execute(profile: CompleteProfile): Promise<string> {
    const today = DateUtils.getSaoPauloDate();
    const allMeals = await this.mealRepository.findMealsByAccountIdAndDate(profile.accountId, today);
    const meals = allMeals.filter(meal => meal.status === Meal.Status.PROCESSED);

    const totals = SummarizeDailyNutritionUseCase.sumFoods(meals);
    const goalMetrics = this.goalCalculator.calculate(profile);

    return this.nutritionFormatter.formatDailySummary(meals, totals, goalMetrics);
  }

  private static sumFoods(meals: Meal[]): SummarizeDailyNutritionUseCase.Totals {
    return meals.reduce<SummarizeDailyNutritionUseCase.Totals>(
      (acc, meal) => {
        for (const food of meal.foods) {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
          acc.fiber += food.fiber;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
  }
}

export namespace SummarizeDailyNutritionUseCase {
  export type Totals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
