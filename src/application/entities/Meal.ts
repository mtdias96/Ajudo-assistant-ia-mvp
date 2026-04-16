import KSUID from 'ksuid';

export class Meal {
  readonly id: string;
  readonly accountId: string;
  status: Meal.Status;
  attempts: number;
  inputType: Meal.InputType;
  name: string;
  icon: string;
  category: Meal.Category;
  foods: Meal.Food[];
  readonly createdAt: Date;

  constructor(attr: Meal.Attributes) {
    this.id = attr.id ?? KSUID.randomSync().string;
    this.accountId = attr.accountId;
    this.status = attr.status;
    this.attempts = attr.attempts;
    this.inputType = attr.inputType;
    this.name = attr.name;
    this.icon = attr.icon;
    this.category = attr.category;
    this.foods = attr.foods;
    this.createdAt = attr.createdAt ?? new Date();
  }
}

export namespace Meal {
  export type Attributes = {
    id?: string;
    accountId: string;
    status: Status;
    attempts: number;
    inputType: InputType;
    name: string;
    icon: string;
    category: Category;
    foods: Food[];
    createdAt?: Date;
  };

  export enum Category {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    SNACK = 'SNACK',
    DINNER = 'DINNER',
    OTHER = 'OTHER',
  }

  export enum Status {
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
    PROCESSED = 'PROCESSED',
    FAILED = 'FAILED',
    DELETED = 'DELETED',
  }

  export enum InputType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
  }

  export type Food = {
    name: string;
    quantity: string;
    quantityGrams?: number;
    source?: FoodSource;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };

  export enum FoodSource {
    TACO = 'TACO',
    ESTIMATED = 'ESTIMATED',
  }
}
