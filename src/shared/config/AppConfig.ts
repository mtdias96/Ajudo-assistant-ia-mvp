import { Injectable } from '@kernel/decorators/Injectable';
import { env } from './env';

@Injectable()
export class AppConfig {
  readonly twilio: AppConfig.Twilio;

  readonly vertexai: AppConfig.VertexAI;

  readonly db: AppConfig.Database;

  constructor() {
    this.twilio = {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      whatsappFrom: env.TWILIO_WHATSAPP_FROM,
    };

    this.vertexai = {
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
    };

    this.db = {
      dynamodb: {
        mainTable: env.MAIN_TABLE_NAME,
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
  };

  export type Database = {
    dynamodb: {
      mainTable: string;
    };
  };
}
