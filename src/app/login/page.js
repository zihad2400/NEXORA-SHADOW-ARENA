import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const session = await getSession();
  const callbackUrl = searchParams?.callbackUrl || '/dashboard';
  
  if (session?.user?.id) redirect(callbackUrl);
  
  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Sign in</h1>
      <p className="text-text-secondary text-sm mb-8">Access your dashboard and continue playing.</p>
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
