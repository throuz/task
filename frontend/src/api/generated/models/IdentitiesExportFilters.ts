/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IdentitiesExportFilters = {
    /**
     * Export range type. UI always sends 'custom' with explicit dates.
     */
    range?: string;
    /**
     * Custom range start date (required when range='custom').
     */
    from_date?: (string | null);
    /**
     * Custom range end date (required when range='custom').
     */
    to_date?: (string | null);
};

