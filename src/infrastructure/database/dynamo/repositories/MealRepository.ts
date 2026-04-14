import { Meal } from '@application/entities/Meal';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { MealItem } from '../items/MealItem';

@Injectable()
export class MealRepository {
  constructor(private readonly config: AppConfig) { }

  async save(meal: Meal): Promise<void> {
    const item = MealItem.fromEntity(meal);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: item.toItem(),
    });

    await dynamoClient.send(command);
  }

  async findPending(accountId: string): Promise<Meal | null> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': MealItem.getGSI2PK(accountId),
      },
      Limit: 1,
    });

    const response = await dynamoClient.send(command);

    const item = response.Items?.[0];
    if (!item) {
      return null;
    }

    return MealItem.toEntity(item as MealItem.ItemType);
  }

  async findLastProcessed(accountId: string, date: Date): Promise<Meal | null> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':pk': MealItem.getGSI1PK({ accountId, createdAt: date }),
        ':sk': 'MEAL#',
        ':status': Meal.Status.PROCESSED,
      },
      ScanIndexForward: false,
      Limit: 20,
    });

    const response = await dynamoClient.send(command);

    const item = response.Items?.[0];
    if (!item) {
      return null;
    }

    return MealItem.toEntity(item as MealItem.ItemType);
  }

  async findMealsByAccountIdAndDate(accountId: string, date: Date): Promise<Meal[]> {
    const command = new QueryCommand({
      TableName: this.config.db.dynamodb.mainTable,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': MealItem.getGSI1PK({ accountId, createdAt: date }),
        ':sk': 'MEAL#',
      },
    });

    const response = await dynamoClient.send(command);

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item) => MealItem.toEntity(item as MealItem.ItemType));
  }
}
