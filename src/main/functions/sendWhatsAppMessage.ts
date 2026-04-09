import 'reflect-metadata';
import { SendWhatsAppMessageController } from '@application/controller/SendWhatsAppMessageController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(SendWhatsAppMessageController);
