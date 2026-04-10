import axios from 'axios';

import { env } from '@shared/config/env';

export const twilioClient = axios.create({
  baseURL: `https://api.twilio.com/2010-04-01/Accounts/${env.twilio.accountSid}`,
  auth: {
    username: env.twilio.accountSid,
    password: env.twilio.authToken,
  },
  timeout: 10_000,
});
