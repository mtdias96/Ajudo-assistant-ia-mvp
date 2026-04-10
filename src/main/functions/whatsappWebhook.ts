import 'reflect-metadata';
import { WhatsAppWebhookController } from '@application/controller/WhatsAppWebhookController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(WhatsAppWebhookController);
