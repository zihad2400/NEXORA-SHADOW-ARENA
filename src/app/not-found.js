import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="surface-elevated p-8 max-w-md text-center">
        <div className="text-5xl font-display font-bold text-gradient mb-2">404</div>
        <h1 className="font-display text-xl font-bold mb-2">Page not found</h1>
        <p className="text-text-secondary text-sm mb-6">The arena does not contain this route.</p>
        <Link href="/" className="btn-nexora">Go home</Link>
      </div>
    </div>
  );
}
