import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuthService,
  type ContactMessageCreate,
  ContactMessagesService,
  HealthService,
  type SendVerificationRequest,
  type VerifyEmailRequest,
  type CreateDraftRequest,
  type SaveDraftRequest,
} from '../api';

export function useHealthcheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => HealthService.healthcheckHealthGet(),
  });
}

export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (body: SendVerificationRequest) => AuthService.sendVerificationCodeApiV1AuthSendVerificationCodePost(body),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: VerifyEmailRequest) => AuthService.verifyEmailApiV1AuthVerifyEmailPost(body),
  });
}

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (body: ContactMessageCreate) =>
      ContactMessagesService.submitContactMessageApiV1ContactMessagesPost(body),
  });
}

export function useCreateRegistrationDraft() {
  return useMutation({
    mutationFn: (body: CreateDraftRequest) => AuthService.createRegistrationDraftApiV1AuthRegisterDraftPost(body),
  });
}

export function useSaveRegistrationDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveDraftRequest) => AuthService.saveRegistrationDraftApiV1AuthRegisterDraftPut(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
}
