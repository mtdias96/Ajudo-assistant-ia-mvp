import path from 'node:path';

import { GoogleAuth } from 'google-auth-library';

const keyFilename = path.resolve('keys/gen-lang-client-0058593993-b409588fa308.json');

export const vertexAuth = new GoogleAuth({
  keyFilename,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});
