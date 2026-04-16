import { Meal } from '@application/entities/Meal';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class FoodFinder {
  find(meal: Meal, query: string): Meal.Food | undefined {
    const normalized = FoodFinder.normalize(query);

    return meal.foods.find((food) => {
      const candidate = FoodFinder.normalize(food.name);
      return candidate.includes(normalized) || normalized.includes(candidate);
    });
  }

  private static normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
