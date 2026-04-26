import { Meal } from '@application/entities/Meal';
import { NutritionGoal } from '@application/entities/NutritionGoal';
import { CompleteProfile } from '@application/entities/Profile';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealCategoryResolver } from '@application/services/nutrition/MealCategoryResolver';
import { NutritionEnricher } from '@application/services/nutrition/NutritionEnricher';
import { NutritionIntent } from '@application/services/types/ExtractedIntent';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { NutritionGoalRepository } from '@infrastructure/database/dynamo/repositories/NutritionGoalRepository';
import { Injectable } from '@kernel/decorators/Injectable';

import { NutritionFormatter } from '@application/services/formatters/NutritionFormatter';

@Injectable()
export class AnalyzeNutritionUseCase {
  private static readonly MAX_ITEMS = 10;

  constructor(
    private readonly nutritionGoalRepository: NutritionGoalRepository,
    private readonly mealRepository: MealRepository,
    private readonly goalCalculator: GoalCalculator,
    private readonly mealCategoryResolver: MealCategoryResolver,
    private readonly nutritionFormatter: NutritionFormatter,
    private readonly nutritionEnricher: NutritionEnricher,
  ) { }

  async execute(extracted: NutritionIntent, profile: CompleteProfile, inputType: Meal.InputType = Meal.InputType.TEXT): Promise<string> {
    if (extracted.items.length > AnalyzeNutritionUseCase.MAX_ITEMS) {
      return `Envie no máximo ${AnalyzeNutritionUseCase.MAX_ITEMS} alimentos por mensagem.`;
    }

    const now = new Date();
    const category = extracted.category ?? this.mealCategoryResolver.fromDate(now);

    const [goalMetrics, , foods, todaysMeals] = await Promise.all([
      this.resolveGoal(profile),
      this.discardPendingMeal(profile.accountId),
      this.nutritionEnricher.enrich(extracted.items),
      this.mealRepository.findMealsByAccountIdAndDate(profile.accountId, now),
    ]);
    const consumedToday = AnalyzeNutritionUseCase.sumFoods(
      todaysMeals.filter(m => m.status === Meal.Status.PROCESSED),
    );

    const meal = new Meal({
      accountId: profile.accountId,
      status: Meal.Status.PENDING_CONFIRMATION,
      attempts: 1,
      inputType,
      name: extracted.items[0]?.name ?? 'Refeição Rápida',
      icon: this.mealCategoryResolver.icon(category),
      category,
      foods,
      createdAt: now,
    });

    await this.mealRepository.save(meal);

    return this.nutritionFormatter.formatDraft(meal, goalMetrics, consumedToday);
  }

  private async discardPendingMeal(accountId: string): Promise<void> {
    const pending = await this.mealRepository.findPending(accountId);
    if (!pending) {
      return;
    }

    pending.status = Meal.Status.DELETED;
    await this.mealRepository.save(pending);
  }

  private async resolveGoal(profile: CompleteProfile): Promise<GoalCalculator.CalculateGoalResult> {
    const profileHash = NutritionGoal.hashProfile(profile);
    const existing = await this.nutritionGoalRepository.findByAccountId(profile.accountId);

    if (existing && existing.profileHash === profileHash) {
      return {
        calories: existing.calories,
        proteins: existing.proteins,
        carbohydrates: existing.carbohydrates,
        fats: existing.fats,
      };
    }

    const metrics = this.goalCalculator.calculate(profile);
    const goal = new NutritionGoal({
      accountId: profile.accountId,
      tdee: metrics.calories,
      calories: metrics.calories,
      proteins: metrics.proteins,
      carbohydrates: metrics.carbohydrates,
      fats: metrics.fats,
      profileHash,
    });
    await this.nutritionGoalRepository.save(goal);

    return metrics;
  }

  private static sumFoods(meals: Meal[]): AnalyzeNutritionUseCase.Totals {
    return meals.reduce<AnalyzeNutritionUseCase.Totals>(
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

export namespace AnalyzeNutritionUseCase {
  export type Totals = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
