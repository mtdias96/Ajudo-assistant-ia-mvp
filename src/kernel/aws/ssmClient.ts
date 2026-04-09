import { SSMClient } from '@aws-sdk/client-ssm';

export const ssmClient = new SSMClient({
  region: process.env.AWS_REGION ?? 'sa-east-1',
  ...(process.env.AWS_ENDPOINT_URL && {
    endpoint: process.env.AWS_ENDPOINT_URL,
  }),
});
