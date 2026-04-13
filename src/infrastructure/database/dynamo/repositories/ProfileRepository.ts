import { Profile } from '@application/entities/Profile';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '@infrastructure/clients/aws/dynamoClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { ProfileItem } from '../items/ProfileItem';

@Injectable()
export class ProfileRepository {
  constructor(private readonly config: AppConfig) { }

  async findByAccountId(accountId: string): Promise<Profile | null> {
    const command = new GetCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Key: {
        PK: ProfileItem.getPK(accountId),
        SK: ProfileItem.getSK(accountId),
      },
    });

    const { Item } = await dynamoClient.send(command);

    if (!Item) {
      return null;
    }

    return ProfileItem.toEntity(Item as ProfileItem.ItemType);
  }

  async save(profile: Profile): Promise<void> {
    const profileItem = ProfileItem.fromEntity(profile);

    const command = new PutCommand({
      TableName: this.config.db.dynamodb.mainTable,
      Item: profileItem.toItem(),
    });

    await dynamoClient.send(command);
  }
}
