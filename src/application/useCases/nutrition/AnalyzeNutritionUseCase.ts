import { Meal } from '@application/entities/Meal';
import { NutritionGoal } from '@application/entities/NutritionGoal';
import { CompleteProfile } from '@application/entities/Profile';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealCategoryResolver } from '@application/services/nutrition/MealCategoryResolver';
import { NutritionIntent } from '@application/services/types/ExtractedIntent';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { NutritionGoalRepository } from '@infrastructure/database/dynamo/repositories/NutritionGoalRepository';
import { DateUtils } from '@shared/utils/DateUtils';
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
  ) { }

  async execute(extracted: NutritionIntent, profile: CompleteProfile, inputType: Meal.InputType = Meal.InputType.TEXT): Promise<string> {
    if (extracted.items.length > AnalyzeNutritionUseCase.MAX_ITEMS) {
      return `Envie no máximo ${AnalyzeNutritionUseCase.MAX_ITEMS} alimentos por mensagem.`;
    }

    const goalMetrics = this.goalCalculator.calculate(profile);

    const nutritionGoal = new NutritionGoal({
      accountId: profile.accountId,
      tdee: goalMetrics.calories,
      calories: goalMetrics.calories,
      proteins: goalMetrics.proteins,
      carbohydrates: goalMetrics.carbohydrates,
      fats: goalMetrics.fats,
    });
    await this.nutritionGoalRepository.create(nutritionGoal);

    const now = DateUtils.getSaoPauloDate();
    const category = extracted.category ?? this.mealCategoryResolver.fromDate(now);

    const meal = new Meal({
      accountId: profile.accountId,
      status: Meal.Status.PENDING_CONFIRMATION,
      attempts: 1,
      inputType,
      name: extracted.items[0]?.name ?? 'Refeição Rápida',
      icon: this.mealCategoryResolver.icon(category),
      category,
      foods: extracted.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        calories: i.calories,
        protein: i.protein,
        carbs: i.carbs,
        fat: i.fat,
        fiber: i.fiber,
      })),
      createdAt: now,
    });

    await this.mealRepository.save(meal);

    return this.nutritionFormatter.formatDraft(meal, goalMetrics);
  }
}
