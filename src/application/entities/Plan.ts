import KSUID from 'ksuid';

export class Plan {
  readonly id: string;

  name: string;
  features: PlanFeatures;
  limits: PlanLimits;
  price: number;
  active: boolean;
  updatedAt: string;

  constructor(Attr: Plan.Attributes) {
    this.id = KSUID.randomSync().string;
    this.name = Attr.name;
    this.features = Attr.features;
    this.limits = Attr.limits;
    this.price = Attr.price;
    this.active = Attr.active;
    this.updatedAt = Attr.updatedAt;
  }
}

export namespace Plan {
  export type Attributes = {
    id: string
    name: string
    features: PlanFeatures
    limits: PlanLimits
    price: number
    active: boolean
    updatedAt: string
  }
}

export type PlanFeatures = {
  imageOCR: boolean
  mealTracking: boolean
}

export type PlanLimits = {
  messagesPerDay: number
  tokensPerDay: number
  imageUploadsPerDay: number
}
