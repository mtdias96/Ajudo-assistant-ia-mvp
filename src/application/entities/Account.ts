import KSUID from 'ksuid';

export class Account {
  readonly id: string;
  readonly phone: string;
  readonly channel: AccountChannel;
  readonly createdAt: Date;

  name?: string;
  email?: string;
  externalId?: string;
  planId: string;
  status: AccountStatus;
  updatedAt: string;

  constructor(attr: Account.Attributes) {
    this.id = attr.id ?? KSUID.randomSync().string;
    this.phone = attr.phone;
    this.channel = attr.channel ?? 'whatsapp';
    this.name = attr.name;
    this.email = attr.email;
    this.externalId = attr.externalId;
    this.planId = attr.planId ?? 'free';
    this.status = attr.status ?? 'active';
    this.createdAt = attr.createdAt ?? new Date();
    this.updatedAt = attr.updatedAt ?? this.createdAt.toISOString();
  }
}

export namespace Account {
  export type Attributes = {
    id?: string
    phone: string
    channel?: AccountChannel
    name?: string
    email?: string
    externalId?: string
    planId?: string
    status?: AccountStatus
    createdAt?: Date
    updatedAt?: string
  }
}

export type AccountStatus = 'active' | 'suspended' | 'blocked'
export type AccountChannel = 'whatsapp' | 'app';
