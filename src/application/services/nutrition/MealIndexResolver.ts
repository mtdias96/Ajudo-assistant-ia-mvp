import { Meal } from '@application/entities/Meal';
import { EditMealTarget } from '@application/services/types/ExtractedIntent';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class MealIndexResolver {
  resolve(meals: Meal[], target: EditMealTarget): Meal | null {
    const active = meals
      .filter((meal) => meal.status === Meal.Status.PROCESSED)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (active.length === 0) {
      return null;
    }

    if (target.category === null) {
      return active[active.length - 1];
    }

    const inCategory = active.filter((meal) => meal.category === target.category);

    if (inCategory.length === 0) {
      return null;
    }

    if (target.mealIndex === null) {
      return inCategory[inCategory.length - 1];
    }

    return inCategory[target.mealIndex - 1] ?? null;
  }

  positionInCategory(meals: Meal[], meal: Meal): MealIndexResolver.Position {
    const inCategory = meals
      .filter((candidate) => candidate.status === Meal.Status.PROCESSED)
      .filter((candidate) => candidate.category === meal.category)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const index = inCategory.findIndex((candidate) => candidate.id === meal.id);

    return {
      index: index >= 0 ? index + 1 : null,
      total: inCategory.length,
    };
  }
}

export namespace MealIndexResolver {
  export type Position = {
    index: number | null;
    total: number;
  };
}
