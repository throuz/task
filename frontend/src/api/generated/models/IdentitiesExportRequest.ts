/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IdentitiesExportFilters } from './IdentitiesExportFilters';
export type IdentitiesExportRequest = {
    account_id: string;
    website_id: string;
    user_id: string;
    /**
     * Filter criteria for which identities to export.
     */
    filters: IdentitiesExportFilters;
};

