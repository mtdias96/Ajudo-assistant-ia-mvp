import { Usage } from '@application/entities/Usage';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { UsageItem } from '../items/UsageItem';

@Injectable()
export class UsageRepository {
  constructor(private readonly config: AppConfig) { }

  async create(usage: Usage): Promise<void> {
    const usageItem = UsageItem.fromEntity({
      ...usage,
    });

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: usageItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
