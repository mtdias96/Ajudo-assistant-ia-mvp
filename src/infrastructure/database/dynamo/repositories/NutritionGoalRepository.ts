import { NutritionGoal } from '@application/entities/NutritionGoal';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { NutritionGoalItem } from '../items/NutritionGoalItem';

@Injectable()
export class NutritionGoalRepository {
  constructor(private readonly config: AppConfig) { }

  async create(nutritionGoal: NutritionGoal): Promise<void> {
    const nutritionGoalItem = NutritionGoalItem.fromEntity(nutritionGoal);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: nutritionGoalItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
