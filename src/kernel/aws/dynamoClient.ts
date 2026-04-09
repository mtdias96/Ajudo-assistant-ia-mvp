import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'sa-east-1',
  ...(process.env.AWS_ENDPOINT_URL && {
    endpoint: process.env.AWS_ENDPOINT_URL,
  }),
});
