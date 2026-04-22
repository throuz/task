/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Structured result from a vendor integration precheck.
 */
export type IntegrationPrecheckData = {
    website_id: string;
    vendor: string;
    reachable: boolean;
    status?: (string | null);
    http_status?: (number | null);
    message?: (string | null);
    raw_error?: null;
};

