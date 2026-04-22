/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntegrationPrecheckData } from './IntegrationPrecheckData';
/**
 * Envelope for integration-precheck responses used in the public API.
 */
export type IntegrationPrecheckResponse = {
    success: boolean;
    data?: (IntegrationPrecheckData | null);
    error?: (Record<string, any> | null);
};

