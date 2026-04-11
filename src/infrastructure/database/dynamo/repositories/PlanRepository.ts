import { Plan } from '@application/entities/Plan';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { PlanItem } from '../items/PlanItem';

@Injectable()
export class PlanRepository {
  constructor(private readonly config: AppConfig) { }

  async create(plan: Plan): Promise<void> {
    const planItem = PlanItem.fromEntity({
      ...plan,
    });

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: planItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
