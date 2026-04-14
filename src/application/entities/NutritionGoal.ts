// nutrition-goal.ts
export class NutritionGoal {
  readonly accountId: string;
  tdee: number;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  water?: number;
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
    this.createdAt = attr.createdAt ?? new Date();
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
    createdAt?: Date
  }
}
