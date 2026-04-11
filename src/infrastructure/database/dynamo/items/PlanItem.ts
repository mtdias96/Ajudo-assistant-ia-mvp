// plan-item.ts
import { Plan, PlanFeatures, PlanLimits } from '@application/entities/Plan';

export class PlanItem {
  private readonly type = 'Plan';

  private readonly keys: PlanItem.Keys;

  constructor(private readonly attr: PlanItem.Attributes) {
    this.keys = {
      PK: PlanItem.getPK(this.attr.id),
      SK: PlanItem.getSK(this.attr.id),
    };
  }

  static fromEntity(plan: Plan): PlanItem {
    return new PlanItem({
      id: plan.id,
      name: plan.name,
      features: plan.features,
      limits: plan.limits,
      price: plan.price,
      active: plan.active,
      updatedAt: plan.updatedAt,
    });
  }

  toItem(): PlanItem.ItemType {
    return {
      ...this.keys,
      ...this.attr,
      type: this.type,
    };
  }

  static getPK(planId: string): PlanItem.Keys['PK'] {
    return `PLAN#${planId}`;
  }

  static getSK(planId: string): PlanItem.Keys['SK'] {
    return `PLAN#${planId}`;
  }
}

export namespace PlanItem {
  export type Keys = {
    PK: `PLAN#${string}`
    SK: `PLAN#${string}`
  }

  export type Attributes = {
    id: string
    name: string
    features: PlanFeatures
    limits: PlanLimits
    price: number
    active: boolean
    updatedAt: string
  }

  export type ItemType = Keys & Attributes & {
    type: 'Plan'
  }
}
