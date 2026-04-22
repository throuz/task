/**
 * API module – export client and (when available) generated types from Swagger/OpenAPI.
 */

export { api, apiRequest, type RequestConfig } from './client';

export { configureGeneratedApiClient } from './configure';
export * from './generated';
