/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResetPasswordWithTokenOnlyRequest = {
    /**
     * Reset token supplied via the password reset email.
     */
    reset_token: string;
    /**
     * New password that meets complexity requirements.
     */
    new_password: string;
};

