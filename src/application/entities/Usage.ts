import KSUID from 'ksuid';

export class Usage {
  readonly id: string;
  readonly accountId: string;
  readonly period: UsagePeriod;
  readonly periodValue: string;

  messagesUsed: number;
  tokensUsed: number;
  imageUploadsUsed: number;
  lastUpdatedAt: string;

  constructor(attr: Usage.Atributes) {
    this.id = KSUID.randomSync().string;
    this.accountId = attr.accountId;
    this.period = attr.period;
    this.periodValue = attr.periodValue;
    this.messagesUsed = attr.messagesUsed;
    this.tokensUsed = attr.tokensUsed;
    this.imageUploadsUsed = attr.imageUploadsUsed;
    this.lastUpdatedAt = attr.lastUpdatedAt;
  }
}

export namespace Usage {
  export type Atributes = {
    id: string
    accountId: string
    period: UsagePeriod
    periodValue: string
    messagesUsed: number
    tokensUsed: number
    imageUploadsUsed: number
    lastUpdatedAt: string
  }
}

export type UsagePeriod = 'daily' | 'monthly'
