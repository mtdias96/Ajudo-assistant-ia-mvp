import { z } from 'zod';

export const SendWhatsAppMessageBodySchema = z.object({
  /** Telefone destino em E.164 (ex: "+5513991226797"). */
  to: z.string().min(1),
  text: z.string().min(1),
});

export type SendWhatsAppMessageBody = z.infer<typeof SendWhatsAppMessageBodySchema>;
