import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@kernel/decorators/Injectable';
import { env } from '@shared/config/env';

@Injectable()
export class WhatsAppGateway {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}`,
      auth: {
        username: env.twilio.accountSid,
        password: env.twilio.authToken,
      },
      timeout: 10_000,
    });
  }

  async sendText(input: WhatsAppGateway.SendTextInput): Promise<void> {
    const params = new URLSearchParams({
      From: this.toWhatsAppAddress(env.twilio.whatsappFrom),
      To: this.toWhatsAppAddress(input.to),
      Body: input.text,
    });

    await this.http.post('/Messages.json', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  private toWhatsAppAddress(value: string): string {
    return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
  }
}

export namespace WhatsAppGateway {
  export type SendTextInput = {
    /** Telefone destino em E.164 (ex: "+5513991226797"). */
    to: string;
    text: string;
  };
}
