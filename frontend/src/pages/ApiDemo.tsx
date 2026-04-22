import { useState } from 'react';
import {
  useCreateRegistrationDraft,
  useLookup,
  useLookupCollections,
  useSaveRegistrationDraft,
  useSubmitContactMessage,
} from '../hooks/useApi';
import { ErrorMessage, Loading } from '../components';

export function ApiDemo() {
  const lookups = useLookupCollections();
  const [lookupName, setLookupName] = useState<string>('');
  const lookup = useLookup(lookupName || null);

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

      {lookups.error && (
        <ErrorMessage
          message={lookups.error instanceof Error ? lookups.error.message : 'Failed to load lookups'}
          onDismiss={() => lookups.refetch()}
        />
      )}
      {lookup.error && (
        <ErrorMessage
          message={lookup.error instanceof Error ? lookup.error.message : 'Failed to load lookup'}
          onDismiss={() => lookup.refetch()}
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
        <h2>GET (list): /api/v1/lookups</h2>
        {lookups.isLoading ? <Loading /> : null}
        {lookups.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(lookups.data, null, 2)}
          </pre>
        ) : null}
      </section>

      <section style={{ marginTop: '1.25rem' }}>
        <h2>GET (detail): /api/v1/lookups/{'{lookup_name}'}</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value)}
            placeholder="lookup_name (e.g. industries)"
            style={{ marginRight: '0.5rem', padding: '0.5rem', width: '100%', maxWidth: '420px' }}
          />
          <button type="button" onClick={() => lookup.refetch()} disabled={!lookupName || lookup.isFetching}>
            {lookup.isFetching ? 'Loading…' : 'Fetch'}
          </button>
        </div>
        {lookup.isLoading ? <Loading /> : null}
        {lookup.data ? (
          <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto' }}>
            {JSON.stringify(lookup.data, null, 2)}
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
