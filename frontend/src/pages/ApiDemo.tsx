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

const preStyle: React.CSSProperties = {
  background: '#f1f5f9',
  color: '#0f172a',
  padding: '1rem',
  borderRadius: '6px',
  overflow: 'auto',
  textAlign: 'left',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 13,
};

function Success({ message }: { message: string }) {
  return (
    <div
      style={{
        marginTop: '0.5rem',
        padding: '0.75rem',
        borderRadius: 6,
        background: '#ecfdf5',
        border: '1px solid #bbf7d0',
        color: '#065f46',
      }}
    >
      <strong>Success:</strong> {message}
    </div>
  );
}

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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>API Demo</h1>
      <p>
        This page demonstrates API integration with loading, error handling, and typed responses.
      </p>
      <p style={{ marginTop: 0 }}>
        Configure <code>VITE_API_BASE_URL</code> (e.g. <code>https://api.larevela.com</code>). Some APIs may require auth
        via <code>VITE_API_TOKEN</code>, but the flows below are designed to work without login.
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
        <h2>1) Connectivity check</h2>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>GET /health</code>. If this succeeds, your base URL is correct and the API is reachable.
        </p>
        {health.isLoading ? <Loading /> : null}
        {health.isSuccess ? <Success message="API is reachable." /> : null}
        {health.data ? (
          <pre style={preStyle}>
            {JSON.stringify(health.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>2) Registration draft flow (no login)</h2>
        <p style={{ marginTop: 0 }}>
          Goal: demonstrate multiple writes (<strong>POST</strong> + <strong>PUT</strong>) using a realistic flow. You’ll
          receive a 6‑digit code by email, then use it to create and update a registration draft.
        </p>

        <h3 style={{ marginBottom: '0.5rem' }}>Step A — Send verification code</h3>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>POST /api/v1/auth/send-verification-code</code>. Output includes a{' '}
          <code>verification_id</code>.
        </p>
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            maxWidth: 520,
            margin: '0 auto 0.75rem',
          }}
        >
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
        {sendCode.isSuccess ? <Success message="Verification code sent. Check your email inbox." /> : null}
        {sendCode.isSuccess ? (
          <pre style={preStyle}>
            {JSON.stringify(sendCode.data ?? null, null, 2)}
          </pre>
        ) : null}

        <h3 style={{ marginBottom: '0.5rem' }}>Step B — Verify email</h3>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>POST /api/v1/auth/verify-email</code>. Output includes a <code>verification_token</code>.
        </p>
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            maxWidth: 520,
            margin: '0 auto 0.75rem',
          }}
        >
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
        {verifyEmail.isSuccess ? <Success message="Email verified. Token received." /> : null}
        {verifyEmail.isSuccess ? (
          <pre style={preStyle}>
            {JSON.stringify(verifyEmail.data ?? null, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>3) Create a contact message</h2>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>POST /api/v1/contact-messages</code>. This is a simple “create” example.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520, margin: '0 auto' }}>
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
        {contact.isSuccess ? <Success message="Contact message submitted." /> : null}
        {contact.isSuccess ? (
          <pre style={preStyle}>
            {JSON.stringify(contact.data ?? null, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>4) Create a registration draft</h2>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>POST /api/v1/auth/register/draft</code>. Requires a <code>verification_token</code> from the
          verification step above.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520, margin: '0 auto' }}>
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
        {draftCreate.isSuccess ? <Success message="Draft created." /> : null}
        {draftCreate.isSuccess ? (
          <pre style={preStyle}>
            {JSON.stringify(draftCreate.data ?? null, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>5) Update the registration draft</h2>
        <p style={{ marginTop: 0 }}>
          Endpoint: <code>PUT /api/v1/auth/register/draft</code>. Uses the <code>draft_id</code> returned by the previous
          step.
        </p>
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: 520, margin: '0 auto' }}>
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
        {draftSave.isSuccess ? <Success message="Draft updated." /> : null}
        {draftSave.isSuccess ? (
          <pre style={preStyle}>
            {JSON.stringify(draftSave.data ?? null, null, 2)}
          </pre>
        ) : null}
      </section>

    </div>
  );
}
