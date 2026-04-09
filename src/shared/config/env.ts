function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  twilio: {
    get accountSid(): string { return required('TWILIO_ACCOUNT_SID'); },
    get authToken(): string { return required('TWILIO_AUTH_TOKEN'); },
    /** Número remetente do Sandbox no formato "+14155238886" ou "whatsapp:+14155238886". */
    get whatsappFrom(): string { return required('TWILIO_WHATSAPP_FROM'); },
  },
};
