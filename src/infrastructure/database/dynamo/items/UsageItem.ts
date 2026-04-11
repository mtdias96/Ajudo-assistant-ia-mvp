// usage-item.ts
import { Usage, UsagePeriod } from '@application/entities/Usage';

export class UsageItem {
  private readonly type = 'Usage';

  private readonly keys: UsageItem.Keys;

  constructor(private readonly attr: UsageItem.Attributes) {
    this.keys = {
      PK: UsageItem.getPK(this.attr.accountId),
      SK: UsageItem.getSK(this.attr.period, this.attr.periodValue),
    };
  }

  static fromEntity(usage: Usage): UsageItem {
    return new UsageItem({
      id: usage.id,
      accountId: usage.accountId,
      period: usage.period,
      periodValue: usage.periodValue,
      messagesUsed: usage.messagesUsed,
      tokensUsed: usage.tokensUsed,
      imageUploadsUsed: usage.imageUploadsUsed,
      lastUpdatedAt: usage.lastUpdatedAt,
    });
  }

  toItem(): UsageItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }

  static getPK(accountId: string): UsageItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(period: UsagePeriod, periodValue: string): UsageItem.Keys['SK'] {
    return `USAGE#${period}#${periodValue}`;
  }
}

export namespace UsageItem {
  export type Keys = {
    PK: `ACCOUNT#${string}`
    SK: `USAGE#${string}#${string}`
  }

  export type Attributes = {
    id: string
    accountId: string
    period: UsagePeriod
    periodValue: string
    messagesUsed: number
    tokensUsed: number
    imageUploadsUsed: number
    lastUpdatedAt: string
  }

  export type ItemType = Keys & Attributes & {
    type: 'Usage'
  }
}
