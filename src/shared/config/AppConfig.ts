import { Injectable } from '@kernel/decorators/Injectable';
import { env } from './env';

@Injectable()
export class AppConfig {
  readonly twilio: AppConfig.Twilio;

  readonly vertexai: AppConfig.VertexAI;

  readonly db: AppConfig.Database;

  readonly qdrant: AppConfig.Qdrant;

  constructor() {
    this.twilio = {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      whatsappFrom: env.TWILIO_WHATSAPP_FROM,
    };

    this.vertexai = {
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
      embeddingModel: env.VERTEX_EMBEDDING_MODEL,
    };

    this.db = {
      dynamodb: {
        mainTable: env.MAIN_TABLE_NAME,
      },
    };

    this.qdrant = {
      url: env.QDRANT_URL,
      apiKey: env.QDRANT_API_KEY,
      collections: {
        nutrition: env.QDRANT_NUTRITION_COLLECTION,
      },
    };

  }
}

export namespace AppConfig {
  export type Twilio = {
    accountSid: string;
    authToken: string;
    whatsappFrom: string;
  };

  export type VertexAI = {
    project: string;
    location: string;
    embeddingModel: string;
  };

  export type Database = {
    dynamodb: {
      mainTable: string;
    };
  };

  export type Qdrant = {
    url: string;
    apiKey: string;
    collections: {
      nutrition: string;
    };
  };
}
