interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div
      style={{
        marginTop: '0.5rem',
        padding: '0.75rem 1rem',
        borderRadius: 6,
        background: '#ecfdf5',
        border: '1px solid #bbf7d0',
        color: '#065f46',
        textAlign: 'left',
      }}
    >
      <strong>Success:</strong> {message}
    </div>
  );
}

