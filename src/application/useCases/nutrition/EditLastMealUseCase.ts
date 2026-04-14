import { Meal } from '@application/entities/Meal';
import { CompleteProfile } from '@application/entities/Profile';
import { AiService } from '@application/services/AiService';
import { GoalCalculator } from '@application/services/nutrition/GoalCalculator';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';
import { DateUtils } from '@shared/utils/DateUtils';

import { NutritionFormatter } from '@application/services/formatters/NutritionFormatter';

@Injectable()
export class EditLastMealUseCase {
  constructor(
    private readonly aiService: AiService,
    private readonly mealRepository: MealRepository,
    private readonly goalCalculator: GoalCalculator,
    private readonly nutritionFormatter: NutritionFormatter,
  ) { }

  async execute({ profile, message }: EditLastMealUseCase.Input): Promise<string> {
    const today = DateUtils.getSaoPauloDate();
    const lastMeal = await this.mealRepository.findLastProcessed(profile.accountId, today);

    if (!lastMeal) {
      return 'Não encontrei nenhuma refeição registrada hoje pra editar.';
    }

    const resolution = await this.aiService.editLastMeal({
      lastMeal: {
        name: lastMeal.name,
        items: lastMeal.foods,
      },
      message,
    });

    switch (resolution.action) {
      case 'delete': {
        lastMeal.status = Meal.Status.DELETED;
        await this.mealRepository.save(lastMeal);
        return `🗑 Removi: *${lastMeal.name}*`;
      }

      case 'update': {
        lastMeal.foods = resolution.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        }));
        lastMeal.name = resolution.items[0]?.name ?? lastMeal.name;
        lastMeal.status = Meal.Status.PENDING_CONFIRMATION;
        await this.mealRepository.save(lastMeal);

        const metrics = this.goalCalculator.calculate(profile);
        return this.nutritionFormatter.formatDraft(lastMeal, metrics);
      }

      case 'none': {
        return 'Não entendi o que você quer editar. Tente "apaga a última" ou "remove o arroz".';
      }
    }
  }
}

export namespace EditLastMealUseCase {
  export type Input = {
    profile: CompleteProfile;
    message: string;
  };
}
