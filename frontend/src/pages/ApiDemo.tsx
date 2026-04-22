import { useState } from 'react';
import {
  useCreateRegistrationDraft,
  useHealthcheck,
  useSaveRegistrationDraft,
  useSendVerificationCode,
  useSubmitContactMessage,
  useVerifyEmail,
} from '../hooks/useApi';
import { ErrorMessage, Loading } from '../components';

export function ApiDemo() {
  const health = useHealthcheck();

  const sendCode = useSendVerificationCode();
  const verifyEmail = useVerifyEmail();
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPlan, setSignupPlan] = useState('starter');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const contact = useSubmitContactMessage();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const draftCreate = useCreateRegistrationDraft();
  const [verificationToken, setVerificationToken] = useState('');
  const [fullName, setFullName] = useState('');

  const draftSave = useSaveRegistrationDraft();
  const [draftId, setDraftId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  return (
    <div>
      <h1>API Demo</h1>
      <p>
        Configure <code>VITE_API_BASE_URL</code> (e.g. <code>https://api.larevela.com</code>) and optionally{' '}
        <code>VITE_API_TOKEN</code>. This page calls real endpoints from the provided OpenAPI spec.
      </p>

      {health.error && (
        <ErrorMessage
          message={health.error instanceof Error ? health.error.message : 'Failed to load healthcheck'}
          onDismiss={() => health.refetch()}
        />
      )}
      {sendCode.isError && (
        <ErrorMessage
          message={sendCode.error instanceof Error ? sendCode.error.message : 'Failed to send verification code'}
          onDismiss={() => sendCode.reset()}
        />
      )}
      {verifyEmail.isError && (
        <ErrorMessage
          message={verifyEmail.error instanceof Error ? verifyEmail.error.message : 'Failed to verify email'}
          onDismiss={() => verifyEmail.reset()}
        />
      )}
      {contact.isError && (
        <ErrorMessage
          message={contact.error instanceof Error ? contact.error.message : 'Contact submit failed'}
          onDismiss={() => contact.reset()}
        />
      )}
      {draftCreate.isError && (
        <ErrorMessage
          message={draftCreate.error instanceof Error ? draftCreate.error.message : 'Draft create failed'}
          onDismiss={() => draftCreate.reset()}
        />
      )}
      {draftSave.isError && (
        <ErrorMessage
          message={draftSave.error instanceof Error ? draftSave.error.message : 'Draft save failed'}
          onDismiss={() => draftSave.reset()}
        />
      )}

      <section style={{ marginTop: '1.25rem' }}>
        <h2>GET: /health</h2>
        {health.isLoading ? <Loading /> : null}
        {health.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(health.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>POST + POST + POST + PUT: registration draft flow (no login required)</h2>
        <p style={{ marginTop: 0 }}>
          This flow lets you complete a successful <strong>POST</strong> + <strong>PUT</strong> without needing API
          login. You will receive a 6-digit code in your email.
        </p>

        <h3 style={{ marginBottom: '0.5rem' }}>1) POST /api/v1/auth/send-verification-code</h3>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520, marginBottom: '0.75rem' }}>
          <input
            type="email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            placeholder="email"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="text"
            value={signupPlan}
            onChange={(e) => setSignupPlan(e.target.value)}
            placeholder="plan (e.g. starter)"
            style={{ padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() =>
              sendCode.mutate(
                { email: signupEmail.trim(), plan: signupPlan.trim() },
                {
                  onSuccess: (res) => {
                    setVerificationId(res.data.verification_id);
                  },
                }
              )
            }
            disabled={sendCode.isPending || !signupEmail.trim() || !signupPlan.trim()}
          >
            {sendCode.isPending ? 'Sending…' : 'Send code'}
          </button>
        </div>
        {sendCode.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(sendCode.data, null, 2)}
          </pre>
        ) : null}

        <h3 style={{ marginBottom: '0.5rem' }}>2) POST /api/v1/auth/verify-email</h3>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520, marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={verificationId}
            onChange={(e) => setVerificationId(e.target.value)}
            placeholder="verification_id (from step 1)"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6-digit code"
            style={{ padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() =>
              verifyEmail.mutate(
                {
                  email: signupEmail.trim(),
                  verification_id: verificationId.trim(),
                  verification_code: verificationCode.trim(),
                },
                {
                  onSuccess: (res) => setVerificationToken(res.data.verification_token),
                }
              )
            }
            disabled={
              verifyEmail.isPending || !signupEmail.trim() || !verificationId.trim() || !verificationCode.trim()
            }
          >
            {verifyEmail.isPending ? 'Verifying…' : 'Verify'}
          </button>
        </div>
        {verifyEmail.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(verifyEmail.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>POST (create): /api/v1/contact-messages</h2>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="name"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="email"
            style={{ padding: '0.5rem' }}
          />
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="message"
            rows={4}
            style={{ padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() =>
              contact.mutate(
                { name: contactName.trim(), email: contactEmail.trim(), message: contactMessage.trim() },
                {
                  onSuccess: () => {
                    setContactName('');
                    setContactEmail('');
                    setContactMessage('');
                  },
                }
              )
            }
            disabled={contact.isPending || !contactName.trim() || !contactEmail.trim() || !contactMessage.trim()}
          >
            {contact.isPending ? 'Sending…' : 'Send'}
          </button>
        </div>
        {contact.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(contact.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>POST: /api/v1/auth/register/draft</h2>
        <p style={{ marginTop: 0 }}>
          This creates a registration draft. You need a <code>verification_token</code> from the email verification step.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
          <input
            type="text"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            placeholder="verification_token"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="full_name"
            style={{ padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() => draftCreate.mutate({ verification_token: verificationToken.trim(), full_name: fullName.trim() })}
            disabled={draftCreate.isPending || !verificationToken.trim() || !fullName.trim()}
          >
            {draftCreate.isPending ? 'Creating…' : 'Create draft'}
          </button>
        </div>
        {draftCreate.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(draftCreate.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>PUT (update): /api/v1/auth/register/draft</h2>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
          <input
            type="text"
            value={draftId}
            onChange={(e) => setDraftId(e.target.value)}
            placeholder="draft_id"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="company_name"
            style={{ padding: '0.5rem' }}
          />
          <input
            type="text"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="company_website (e.g. https://example.com)"
            style={{ padding: '0.5rem' }}
          />
          <button
            type="button"
            onClick={() =>
              draftSave.mutate({
                draft_id: draftId.trim(),
                company_name: companyName.trim(),
                company_website: companyWebsite.trim(),
              })
            }
            disabled={draftSave.isPending || !draftId.trim() || !companyName.trim() || !companyWebsite.trim()}
          >
            {draftSave.isPending ? 'Saving…' : 'Save draft'}
          </button>
        </div>
        {draftSave.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(draftSave.data, null, 2)}
          </pre>
        ) : null}
      </section>

    </div>
  );
}
