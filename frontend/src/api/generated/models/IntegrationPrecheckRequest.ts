/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request body for the integration-precheck endpoint.
 *
 * - vendor: required vendor code (e.g. 'klaviyo').
 * - config: optional inline configuration to validate. When omitted, the
 * endpoint falls back to the stored website vendor configuration.
 */
export type IntegrationPrecheckRequest = {
    vendor: string;
    config?: (Record<string, any> | null);
};

