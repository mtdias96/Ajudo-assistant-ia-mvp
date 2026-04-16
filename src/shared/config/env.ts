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

  // Qdrant
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().min(1),
  QDRANT_NUTRITION_COLLECTION: z.string().min(1).default('nutrition_taco'),

  // Vertex AI (embeddings)
  VERTEX_EMBEDDING_MODEL: z.string().min(1).default('text-multilingual-embedding-002'),
});

export const env = schema.parse(process.env);
