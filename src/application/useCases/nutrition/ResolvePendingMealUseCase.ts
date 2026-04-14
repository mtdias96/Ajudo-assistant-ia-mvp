import { Meal } from '@application/entities/Meal';
import { CompleteProfile } from '@application/entities/Profile';
import { AiService } from '@application/services/AiService';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';

import { NutritionFormatter } from '@application/services/formatters/NutritionFormatter';

@Injectable()
export class ResolvePendingMealUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly mealRepository: MealRepository,
    private readonly goalCalculator: GoalCalculator,
    private readonly nutritionFormatter: NutritionFormatter,
  ) { }

  async execute({ pending, profile, message }: ResolvePendingMealUseCase.Input): Promise<string> {
    const resolution = await this.aiService.resolvePendingMeal({
      pending: {
        name: pending.name,
        items: pending.foods,
      },
      message,
    });

    switch (resolution.intent) {
      case 'confirm': {
        pending.status = Meal.Status.PROCESSED;
        await this.mealRepository.save(pending);
        return '✅ Refeição registrada!';
      }

      case 'correct': {
        pending.foods = resolution.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        }));
        pending.attempts += 1;
        pending.name = resolution.items[0]?.name ?? pending.name;
        await this.mealRepository.save(pending);

        const metrics = this.goalCalculator.calculate(profile);
        return this.nutritionFormatter.formatDraft(pending, metrics);
      }

      case 'cancel': {
        pending.status = Meal.Status.FAILED;
        await this.mealRepository.save(pending);
        return '🗑 Rascunho cancelado. Pode enviar sua refeição novamente.';
      }

      case 'other': {
        return this.nutritionFormatter.formatBlocked(pending);
      }
    }
  }
}

export namespace ResolvePendingMealUseCase {
  export type Input = {
    pending: Meal;
    profile: CompleteProfile;
    message: string;
  };
}
