import { NutritionGoal } from '@application/entities/NutritionGoal';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { NutritionGoalItem } from '../items/NutritionGoalItem';

@Injectable()
export class NutritionGoalRepository {
  constructor(private readonly config: AppConfig) { }

  async save(nutritionGoal: NutritionGoal): Promise<void> {
    const nutritionGoalItem = NutritionGoalItem.fromEntity(nutritionGoal);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: nutritionGoalItem.toItem(),
    });

    await dynamoClient.send(command);
  }

  async findByAccountId(accountId: string): Promise<NutritionGoal | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: NutritionGoalItem.getPK(accountId),
        SK: NutritionGoalItem.getSK(accountId),
      },
    });

    const response = await dynamoClient.send(command);
    if (!response.Item) {
      return null;
    }

    return NutritionGoalItem.toEntity(response.Item as NutritionGoalItem.ItemType);
  }
}
