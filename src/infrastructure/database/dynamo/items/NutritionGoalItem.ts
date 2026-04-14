import { NutritionGoal } from '@application/entities/NutritionGoal';
import { AccountItem } from './AccountItem';

export class NutritionGoalItem {
  private readonly type = 'NutritionGoal';

  private readonly keys: NutritionGoalItem.Keys;

  constructor(private readonly attr: NutritionGoalItem.Attributes) {
    this.keys = {
      PK: NutritionGoalItem.getPK(this.attr.accountId),
      SK: NutritionGoalItem.getSK(this.attr.accountId),
    };
  }

  static fromEntity(goal: NutritionGoal): NutritionGoalItem {
    return new NutritionGoalItem({
      accountId: goal.accountId,
      tdee: goal.tdee,
      calories: goal.calories,
      proteins: goal.proteins,
      carbohydrates: goal.carbohydrates,
      fats: goal.fats,
      fiber: goal.fiber,
      water: goal.water,
      createdAt: goal.createdAt.toISOString(),
    });
  }

  static toEntity(item: NutritionGoalItem.ItemType): NutritionGoal {
    return new NutritionGoal({
      accountId: item.accountId,
      tdee: item.tdee,
      calories: item.calories,
      proteins: item.proteins,
      carbohydrates: item.carbohydrates,
      fats: item.fats,
      fiber: item.fiber,
      water: item.water,
      createdAt: new Date(item.createdAt),
    });
  }

  toItem(): NutritionGoalItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }

  static getPK(accountId: string): NutritionGoalItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): NutritionGoalItem.Keys['SK'] {
    return `ACCOUNT#${accountId}#NutritionGoal`;
  }
}

export namespace NutritionGoalItem {
  export type Keys = {
    PK: AccountItem.Keys['PK']
    SK: `ACCOUNT#${string}#NutritionGoal`
  }

  export type Attributes = {
    accountId: string
    tdee: number
    calories: number
    proteins: number
    carbohydrates: number
    fats: number
    fiber?: number
    water?: number
    createdAt: string
  }

  export type ItemType = Keys & Attributes & {
    type: 'NutritionGoal'
  }
}
