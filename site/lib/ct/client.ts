import 'server-only';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ClientBuilder } from '@commercetools/ts-client';

const projectKey = process.env.CTP_PROJECT_KEY!;
const authUrl = process.env.CTP_AUTH_URL!;
const apiUrl = process.env.CTP_API_URL!;

for (const [k, v] of Object.entries({ CTP_PROJECT_KEY: projectKey, CTP_AUTH_URL: authUrl, CTP_API_URL: apiUrl, CTP_CLIENT_ID: process.env.CTP_CLIENT_ID, CTP_CLIENT_SECRET: process.env.CTP_CLIENT_SECRET })) {
  if (!v) throw new Error(`Missing environment variable ${k}`);
}

function buildClient() {
  return new ClientBuilder()
    .withProjectKey(projectKey)
    .withClientCredentialsFlow({
      host: authUrl,
      projectKey,
      credentials: {
        clientId: process.env.CTP_CLIENT_ID!,
        clientSecret: process.env.CTP_CLIENT_SECRET!,
      },
      scopes: process.env.CTP_SCOPES ? process.env.CTP_SCOPES.split(/\s+/).filter(Boolean) : undefined,
    })
    .withHttpMiddleware({ host: apiUrl })
    .build();
}

export const apiRoot = createApiBuilderFromCtpClient(buildClient()).withProjectKey({ projectKey });

export { projectKey, apiUrl, authUrl };
