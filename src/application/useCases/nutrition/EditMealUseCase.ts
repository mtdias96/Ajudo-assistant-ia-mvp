import { Meal } from '@application/entities/Meal';
import { CompleteProfile } from '@application/entities/Profile';
import { NutritionFormatter } from '@application/services/formatters/NutritionFormatter';
import { FoodFinder } from '@application/services/nutrition/FoodFinder';
import { MealCategoryResolver } from '@application/services/nutrition/MealCategoryResolver';
import { MealIndexResolver } from '@application/services/nutrition/MealIndexResolver';
import { NutritionEnricher } from '@application/services/nutrition/NutritionEnricher';
import {
  EditMealIntent,
  EditMealOperation,
} from '@application/services/types/ExtractedIntent';
import { MealRepository } from '@infrastructure/database/dynamo/repositories/MealRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class EditMealUseCase {
  constructor(
    private readonly mealRepository: MealRepository,
    private readonly mealIndexResolver: MealIndexResolver,
    private readonly mealCategoryResolver: MealCategoryResolver,
    private readonly nutritionEnricher: NutritionEnricher,
    private readonly nutritionFormatter: NutritionFormatter,
    private readonly foodFinder: FoodFinder,
  ) { }

  async execute({ profile, intent }: EditMealUseCase.Input): Promise<string> {
    const today = new Date();
    const meals = await this.mealRepository.findMealsByAccountIdAndDate(profile.accountId, today);

    const target = this.mealIndexResolver.resolve(meals, intent.target);
    if (!target) {
      return this.nutritionFormatter.formatMealNotFound(intent.target);
    }

    switch (intent.operation) {
      case EditMealOperation.DELETE_MEAL:
        return this.deleteMeal(target, meals);

      case EditMealOperation.DELETE_FOOD:
        return this.deleteFood(target, meals, intent.target.foodName);

      case EditMealOperation.UPDATE_FOOD:
        return this.replaceFood(target, meals, intent, 'Atualizei');

      case EditMealOperation.SWAP_FOOD:
        return this.replaceFood(target, meals, intent, 'Troquei');

      case EditMealOperation.MOVE_MEAL:
        return this.moveMeal(target, meals, intent.destinationCategory);
    }
  }

  private async moveMeal(meal: Meal, meals: Meal[], destination: Meal.Category | null): Promise<string> {
    if (!destination) {
      return 'Me diga pra qual período mover (ex: "mova a refeição 1 do café da manhã pro almoço").';
    }

    if (meal.category === destination) {
      return this.nutritionFormatter.formatMealAlreadyInCategory(destination);
    }

    const fromLabel = this.nutritionFormatter.formatMealLabel(meal, meals);
    meal.category = destination;
    meal.icon = this.mealCategoryResolver.icon(destination);
    await this.mealRepository.save(meal);

    return this.nutritionFormatter.formatMealMoved(fromLabel, destination);
  }

  private async deleteMeal(meal: Meal, meals: Meal[]): Promise<string> {
    const label = this.nutritionFormatter.formatMealLabel(meal, meals);
    meal.status = Meal.Status.DELETED;
    await this.mealRepository.save(meal);

    return this.nutritionFormatter.formatMealDeleted(label);
  }

  private async deleteFood(meal: Meal, meals: Meal[], foodName: string | null): Promise<string> {
    if (!foodName) {
      return 'Me diga qual alimento você quer remover (ex: "tira o arroz do almoço 1").';
    }

    const mealLabel = this.nutritionFormatter.formatMealLabel(meal, meals);
    const removed = this.foodFinder.find(meal, foodName);
    if (!removed) {
      return this.nutritionFormatter.formatFoodNotFound(foodName, mealLabel);
    }

    meal.foods = meal.foods.filter((food) => food !== removed);

    if (meal.foods.length === 0) {
      return this.deleteMeal(meal, meals);
    }

    await this.mealRepository.save(meal);
    return this.nutritionFormatter.formatFoodDeleted(removed.name, mealLabel);
  }

  private async replaceFood(
    meal: Meal,
    meals: Meal[],
    intent: EditMealIntent,
    verb: string,
  ): Promise<string> {
    if (!intent.target.foodName || !intent.change) {
      return 'Me diga o alimento e o que mudar (ex: "no almoço 1 foi 150g de arroz").';
    }

    const mealLabel = this.nutritionFormatter.formatMealLabel(meal, meals);
    const current = this.foodFinder.find(meal, intent.target.foodName);
    if (!current) {
      return this.nutritionFormatter.formatFoodNotFound(intent.target.foodName, mealLabel);
    }

    const [enriched] = await this.nutritionEnricher.enrich([intent.change]);

    meal.foods = meal.foods.map((food) => (food === current ? enriched : food));
    await this.mealRepository.save(meal);

    return this.nutritionFormatter.formatFoodReplaced(verb, current, enriched, mealLabel);
  }
}

export namespace EditMealUseCase {
  export type Input = {
    profile: CompleteProfile;
    intent: EditMealIntent;
  };
}
