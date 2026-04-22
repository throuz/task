import { OpenAPI } from './generated';

function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://api.larevela.com';
}

export function configureGeneratedApiClient() {
  OpenAPI.BASE = getBaseUrl().replace(/\/$/, '');

  const token = import.meta.env.VITE_API_TOKEN as string | undefined;
  OpenAPI.TOKEN = token || undefined;

  const withCredentialsEnv = import.meta.env.VITE_API_WITH_CREDENTIALS as string | undefined;
  const withCredentials = withCredentialsEnv === 'true';
  OpenAPI.WITH_CREDENTIALS = withCredentials;
  OpenAPI.CREDENTIALS = withCredentials ? 'include' : 'omit';
}

