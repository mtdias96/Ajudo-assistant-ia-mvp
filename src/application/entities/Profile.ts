export class Profile {
  readonly accountId: string;

  name?: string;
  birthDate?: Date;
  gender?: Profile.Gender;
  height?: number;
  weight?: number;
  activityLevel?: Profile.ActivityLevel;
  goalType?: Profile.GoalType;
  onboardingCompleted?: boolean;
  readonly createdAt: Date;

  constructor(attr: Profile.Attributes) {
    this.accountId = attr.accountId;
    this.name = attr.name;
    this.birthDate = attr.birthDate;
    this.gender = attr.gender;
    this.height = attr.height;
    this.weight = attr.weight;
    this.activityLevel = attr.activityLevel;
    this.goalType = attr.goalType;
    this.onboardingCompleted = attr.onboardingCompleted;
    this.createdAt = attr.createdAt ?? new Date();
  }

  isComplete(): boolean {
    return this.onboardingCompleted === true;
  }

  hasAllFields(): boolean {
    return (
      this.name !== undefined &&
      this.birthDate !== undefined &&
      this.gender !== undefined &&
      this.height !== undefined &&
      this.weight !== undefined &&
      this.activityLevel !== undefined &&
      this.goalType !== undefined
    );
  }
}

export namespace Profile {
  export type Attributes = {
    accountId: string;
    name?: string;
    birthDate?: Date;
    gender?: Gender;
    height?: number;
    weight?: number;
    activityLevel?: ActivityLevel;
    goalType?: GoalType;
    onboardingCompleted?: boolean;
    createdAt?: Date;
  };

  export enum Gender {
    MALE = 'MALE',
    FAMALE = 'FEMALE',
  }

  export enum ActivityLevel {
    SEDENTARY = 'SEDENTARY',
    LIGHT = 'LIGHT',
    MODERATE = 'MODERATE',
    HEAVY = 'HEAVY',
    ATHLETE = 'ATHLETE',
  }

  export type GoalType = 'maintain' | 'gain' | 'lose';
}

