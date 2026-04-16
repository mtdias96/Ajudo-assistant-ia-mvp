import { createHash } from 'node:crypto';

import { CompleteProfile } from './Profile';

export class NutritionGoal {
  readonly accountId: string;
  tdee: number;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  water?: number;
  profileHash: string;
  readonly createdAt: Date;

  constructor(attr: NutritionGoal.Props) {
    this.accountId = attr.accountId;
    this.tdee = attr.tdee;
    this.calories = attr.calories;
    this.proteins = attr.proteins;
    this.carbohydrates = attr.carbohydrates;
    this.fats = attr.fats;
    this.fiber = attr.fiber;
    this.water = attr.water;
    this.profileHash = attr.profileHash;
    this.createdAt = attr.createdAt ?? new Date();
  }

  static hashProfile(profile: CompleteProfile): string {
    const signature = [
      profile.weight,
      profile.height,
      profile.birthDate.toISOString(),
      profile.gender,
      profile.activityLevel,
      profile.goalType,
    ].join('|');

    return createHash('sha1').update(signature).digest('hex');
  }
}

export namespace NutritionGoal {
  export type Props = {
    accountId: string
    tdee: number
    calories: number
    proteins: number
    carbohydrates: number
    fats: number
    fiber?: number
    water?: number
    profileHash: string
    createdAt?: Date
  }
}
