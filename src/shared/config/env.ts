import { z } from 'zod';

const schema = z.object({
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_WHATSAPP_FROM: z.string().min(1),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  GOOGLE_CLOUD_LOCATION: z.string().min(1),

  // Database
  MAIN_TABLE_NAME: z.string().min(1),
});

export const env = schema.parse(process.env);
