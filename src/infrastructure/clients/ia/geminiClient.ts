import path from 'node:path';

import { VertexAI } from '@google-cloud/vertexai';

import { env } from '@shared/config/env';

const keyFilename = path.resolve('keys/gen-lang-client-0058593993-b409588fa308.json');

export const vertexai = new VertexAI({
  project: env.GOOGLE_CLOUD_PROJECT,
  location: env.GOOGLE_CLOUD_LOCATION,
  googleAuthOptions: {
    keyFilename,
  },
});
