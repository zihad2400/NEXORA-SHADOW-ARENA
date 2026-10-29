'use client';

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="surface-elevated p-8 max-w-md text-center">
        <div className="text-3xl mb-4">⚠</div>
        <h1 className="font-display text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-text-secondary text-sm mb-6 break-words">
          {error?.message || 'Unknown error'}
        </p>
        <button onClick={() => reset()} className="btn-nexora">
          Try again
        </button>
      </div>
    </div>
  );
}
