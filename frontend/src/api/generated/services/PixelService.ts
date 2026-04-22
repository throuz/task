/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PixelBootstrapConfig } from '../models/PixelBootstrapConfig';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PixelService {
    /**
     * Bootstrap LaRevela pixel configuration
     * @param origin
     * @param env
     * @param originQuery
     * @param referer
     * @returns PixelBootstrapConfig Successful Response
     * @throws ApiError
     */
    public static bootstrapPixelApiV1PixelBootstrapGet(
        origin?: (string | null),
        env?: (string | null),
        originQuery?: (string | null),
        referer?: (string | null),
    ): CancelablePromise<PixelBootstrapConfig> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/pixel/bootstrap',
            headers: {
                'Origin': origin,
                'Referer': referer,
            },
            query: {
                'origin': originQuery,
                'env': env,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
