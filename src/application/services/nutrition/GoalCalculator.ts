import { CompleteProfile, Profile } from '@application/entities/Profile';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GoalCalculator {
  private readonly macroRatios: Record<Profile.Goal, GoalCalculator.MacroRatio> = {
    [Profile.Goal.LOSE]: {
      proteins: 2.2,
      fats: 0.8,
    },
    [Profile.Goal.GAIN]: {
      proteins: 1.8,
      fats: 1,
    },
    [Profile.Goal.MAINTAIN]: {
      proteins: 1.8,
      fats: 0.9,
    },
  };

  private readonly activityMultipliers: Record<Profile.ActivityLevel, number> = {
    [Profile.ActivityLevel.SEDENTARY]: 1.2,
    [Profile.ActivityLevel.LIGHT]: 1.375,
    [Profile.ActivityLevel.MODERATE]: 1.55,
    [Profile.ActivityLevel.HEAVY]: 1.725,
    [Profile.ActivityLevel.ATHLETE]: 1.9,
  };

  calculate(profile: CompleteProfile): GoalCalculator.CalculateGoalResult {
    const { weight, goalType } = profile;
    const { proteins, fats } = this.macroRatios[goalType];

    const calories = this.calcCalories(profile);

    const proteinGrams = weight * proteins;
    const proteinCalories = proteinGrams * 4;

    const fatGramsRaw = weight * fats;
    const fatGrams = Math.max(0.6 * weight, fatGramsRaw);
    const fatCalories = fatGrams * 9;

    const remainingCalories = Math.max(
      0,
      calories - proteinCalories - fatCalories,
    );

    const carbsGrams = remainingCalories / 4;
    const carbsCalories = carbsGrams * 4;

    return {
      calories: Math.round(proteinCalories + fatCalories + carbsCalories),
      proteins: Math.round(proteinGrams),
      fats: Math.round(fatGrams),
      carbohydrates: Math.round(carbsGrams),
    };
  }

  private calcCalories(profile: CompleteProfile): number {
    const { height, weight, gender, birthDate, activityLevel, goalType } = profile;

    const age = this.calculateAge(birthDate);

    const bmr =
      gender === Profile.Gender.MALE
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * this.activityMultipliers[activityLevel];

    const deficit = tdee * 0.15;
    const surplus = tdee * 0.1;

    if (goalType === Profile.Goal.MAINTAIN) { return Math.round(tdee); }
    if (goalType === Profile.Goal.GAIN) { return Math.round(tdee + surplus); }

    return Math.round(tdee - deficit);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) { age--; }

    return age;
  }
}

export namespace GoalCalculator {
  export type CalculateGoalResult = {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  };

  export type MacroRatio = {
    proteins: number;
    fats: number;
  };
}
