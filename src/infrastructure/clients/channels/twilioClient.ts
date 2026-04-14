import axios from 'axios';

import { env } from '@shared/config/env';

export const twilioClient = axios.create({
  baseURL: `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}`,
  auth: {
    username: env.TWILIO_ACCOUNT_SID,
    password: env.TWILIO_AUTH_TOKEN,
  },
  timeout: 15000,
});
