import { NutritionItem } from '@application/services/types/NutritionResult';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class NutritionGuardrails {
  private static readonly MAX_CALORIES_PER_100G = 900;
  private static readonly MAX_PROTEIN_PER_100G = 90;
  private static readonly MAX_CARBS_PER_100G = 100;
  private static readonly MAX_FAT_PER_100G = 100;
  private static readonly MAX_FIBER_PER_100G = 50;
  private static readonly CALORIE_DRIFT_TOLERANCE = 0.25;

  sanitize(item: NutritionItem, grams: number | null): NutritionGuardrails.Macros {
    if (grams === null || grams <= 0) {
      return this.clampNonNegative(item);
    }

    const factor = grams / 100;

    const protein = this.clamp(item.protein / factor, NutritionGuardrails.MAX_PROTEIN_PER_100G);
    const carbs = this.clamp(item.carbs / factor, NutritionGuardrails.MAX_CARBS_PER_100G);
    const fat = this.clamp(item.fat / factor, NutritionGuardrails.MAX_FAT_PER_100G);
    const fiber = this.clamp(item.fiber / factor, NutritionGuardrails.MAX_FIBER_PER_100G);

    const declaredCalories = this.clamp(item.calories / factor, NutritionGuardrails.MAX_CALORIES_PER_100G);
    const derivedCalories = 4 * protein + 4 * carbs + 9 * fat;

    const calories = this.reconcileCalories(declaredCalories, derivedCalories);

    return {
      calories: Math.round(calories * factor),
      protein: Math.round(protein * factor),
      carbs: Math.round(carbs * factor),
      fat: Math.round(fat * factor),
      fiber: Math.round(fiber * factor),
    };
  }

  private reconcileCalories(declared: number, derived: number): number {
    if (derived <= 0) {
      return declared;
    }

    const drift = Math.abs(declared - derived) / derived;
    if (drift > NutritionGuardrails.CALORIE_DRIFT_TOLERANCE) {
      return derived;
    }

    return declared;
  }

  private clamp(value: number, max: number): number {
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return Math.min(value, max);
  }

  private clampNonNegative(item: NutritionItem): NutritionGuardrails.Macros {
    return {
      calories: Math.max(0, Math.round(item.calories)),
      protein: Math.max(0, Math.round(item.protein)),
      carbs: Math.max(0, Math.round(item.carbs)),
      fat: Math.max(0, Math.round(item.fat)),
      fiber: Math.max(0, Math.round(item.fiber)),
    };
  }
}

export namespace NutritionGuardrails {
  export type Macros = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
