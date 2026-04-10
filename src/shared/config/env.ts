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
    get whatsappFrom(): string { return required('TWILIO_WHATSAPP_FROM'); },
  },
  vertexai: {
    get project(): string { return required('GOOGLE_CLOUD_PROJECT'); },
    get location(): string { return required('GOOGLE_CLOUD_LOCATION'); },
  },
};
