import { Profile } from '@application/entities/Profile';
import { AccountItem } from './AccountItem';

export class ProfileItem {
  private readonly type = 'Profile';

  private readonly keys: ProfileItem.Keys;

  constructor(private readonly attr: ProfileItem.Attributes) {
    this.keys = {
      PK: ProfileItem.getPK(this.attr.accountId),
      SK: ProfileItem.getSK(this.attr.accountId),
    };
  }

  static fromEntity(profile: Profile): ProfileItem {
    return new ProfileItem({
      accountId: profile.accountId,
      name: profile.name,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      activityLevel: profile.activityLevel,
      goalType: profile.goalType,
      onboardingCompleted: profile.onboardingCompleted,
      birthDate: profile.birthDate?.toISOString(),
      createdAt: profile.createdAt.toISOString(),
    });
  }

  static toEntity(item: ProfileItem.ItemType): Profile {
    return new Profile({
      accountId: item.accountId,
      name: item.name,
      gender: item.gender,
      height: item.height,
      weight: item.weight,
      activityLevel: item.activityLevel,
      goalType: item.goalType,
      onboardingCompleted: item.onboardingCompleted,
      birthDate: item.birthDate ? new Date(item.birthDate) : undefined,
      createdAt: new Date(item.createdAt),
    });
  }

  toItem(): ProfileItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }

  static getPK(accountId: string): ProfileItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): ProfileItem.Keys['SK'] {
    return `ACCOUNT#${accountId}#PROFILE`;
  }
}

export namespace ProfileItem {
  export type Keys = {
    PK: AccountItem.Keys['PK']
    SK: `ACCOUNT#${string}#PROFILE`
  }

  export type Attributes = {
    accountId: string;
    name?: string;
    birthDate?: string;
    gender?: Profile.Gender;
    height?: number;
    weight?: number;
    activityLevel?: Profile.ActivityLevel;
    goalType?: Profile.GoalType;
    onboardingCompleted?: boolean;
    createdAt: string;
  };

  export type ItemType = Keys & Attributes & {
    type: 'Profile'
  }
}
