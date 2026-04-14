import axios from 'axios';

import { twilioClient } from '@infrastructure/clients/channels/twilioClient';
import { Injectable } from '@kernel/decorators/Injectable';
import { env } from '@shared/config/env';

@Injectable()
export class WhatsAppGateway {
  private static readonly MAX_BODY_LENGTH = 1600;

  async sendText({
    to,
    text,
  }: WhatsAppGateway.SendTextInput): Promise<void> {
    const chunks = this.splitMessage(text);

    for (const chunk of chunks) {
      const params = new URLSearchParams({
        From: this.toWhatsAppAddress(env.TWILIO_WHATSAPP_FROM),
        To: this.toWhatsAppAddress(to),
        Body: chunk,
      });

      await twilioClient.post('/Messages.json', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    }
  }

  async fetchMedia(url: string): Promise<WhatsAppGateway.FetchMediaResult> {
    const redirect = await twilioClient.get(url, {
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
      responseType: 'arraybuffer',
    });

    const location = redirect.headers.location as string | undefined;

    if (!location) {
      const buffer = Buffer.from(redirect.data as ArrayBuffer);
      return {
        buffer,
        contentType: String(redirect.headers['content-type'] ?? ''),
      };
    }

    const file = await axios.get<ArrayBuffer>(location, {
      responseType: 'arraybuffer',
    });

    return {
      buffer: Buffer.from(file.data),
      contentType: String(file.headers['content-type'] ?? ''),
    };
  }

  private splitMessage(text: string): string[] {
    if (text.length <= WhatsAppGateway.MAX_BODY_LENGTH) {
      return [text];
    }

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= WhatsAppGateway.MAX_BODY_LENGTH) {
        chunks.push(remaining);
        break;
      }

      let splitIndex = remaining.lastIndexOf('\n', WhatsAppGateway.MAX_BODY_LENGTH);

      if (splitIndex <= 0) {
        splitIndex = remaining.lastIndexOf(' ', WhatsAppGateway.MAX_BODY_LENGTH);
      }

      if (splitIndex <= 0) {
        splitIndex = WhatsAppGateway.MAX_BODY_LENGTH;
      }

      chunks.push(remaining.slice(0, splitIndex));
      remaining = remaining.slice(splitIndex).trimStart();
    }

    return chunks;
  }

  private toWhatsAppAddress(value: string): string {
    return value.startsWith('whatsapp:') ? value : `whatsapp:${value}`;
  }
}

export namespace WhatsAppGateway {
  export type SendTextInput = {
    to: string;
    text: string;
  };

  export type FetchMediaResult = {
    buffer: Buffer;
    contentType: string;
  };
}
