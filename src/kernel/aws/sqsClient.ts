import { SQSClient } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION ?? 'sa-east-1',
  ...(process.env.AWS_ENDPOINT_URL && {
    endpoint: process.env.AWS_ENDPOINT_URL,
  }),
});
