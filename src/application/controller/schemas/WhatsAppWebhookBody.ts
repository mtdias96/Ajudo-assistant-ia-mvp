import { z } from 'zod';

/**
 * Payload do webhook do Twilio Sandbox for WhatsApp.
 * O Twilio envia application/x-www-form-urlencoded com campos achatados.
 * Docs: https://www.twilio.com/docs/messaging/guides/webhook-request
 */
export const WhatsAppWebhookBodySchema = z.looseObject({
  MessageSid: z.string(),
  From: z.string(), // ex: "whatsapp:+5513991226797"
  To: z.string(),   // ex: "whatsapp:+14155238886"
  Body: z.string().optional(),
  ProfileName: z.string().optional(),
  WaId: z.string().optional(),
  NumMedia: z.string().optional(),
});

export type WhatsAppWebhookBody = z.infer<typeof WhatsAppWebhookBodySchema>;
