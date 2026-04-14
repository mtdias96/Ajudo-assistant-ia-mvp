import { Account, AccountChannel, AccountStatus } from '@application/entities/Account';

export class AccountItem {
  private readonly type = 'Account';

  private readonly keys: AccountItem.Keys;

  constructor(private readonly attr: AccountItem.Attributes) {
    this.keys = {
      PK: AccountItem.getPK(this.attr.id),
      SK: AccountItem.getSK(this.attr.id),
      GSI1PK: AccountItem.getGSI1PK(this.attr.phone),
      GSI1SK: AccountItem.getGSI1SK(this.attr.phone),
    };
  }

  static fromEntity(account: Account): AccountItem {
    return new AccountItem({
      id: account.id,
      phone: account.phone,
      channel: account.channel,
      name: account.name,
      email: account.email,
      externalId: account.externalId,
      planId: account.planId,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt,
    });
  }

  static toEntity(item: AccountItem.ItemType): Account {
    return new Account({
      id: item.id,
      phone: item.phone,
      channel: item.channel,
      name: item.name,
      email: item.email,
      externalId: item.externalId,
      planId: item.planId,
      status: item.status,
      createdAt: new Date(item.createdAt),
      updatedAt: item.updatedAt,
    });
  }

  toItem(): AccountItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }

  static getPK(accountId: string): AccountItem.Keys['PK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getSK(accountId: string): AccountItem.Keys['SK'] {
    return `ACCOUNT#${accountId}`;
  }

  static getGSI1PK(phone: string): AccountItem.Keys['GSI1PK'] {
    return `PHONE#${phone}`;
  }

  static getGSI1SK(phone: string): AccountItem.Keys['GSI1SK'] {
    return `PHONE#${phone}`;
  }
}

export namespace AccountItem {
  export type Keys = {
    PK: `ACCOUNT#${string}`
    SK: `ACCOUNT#${string}`
    GSI1PK: `PHONE#${string}`
    GSI1SK: `PHONE#${string}`
  }

  export type Attributes = {
    id: string
    phone: string
    channel: AccountChannel
    name?: string
    email?: string
    externalId?: string
    planId: string
    status: AccountStatus
    createdAt: string
    updatedAt: string
  }

  export type ItemType = Keys & Attributes & {
    type: 'Account'
  }
}
