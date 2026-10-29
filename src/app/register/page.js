import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({ searchParams }) {
  const session = await getSession();
  const callbackUrl = searchParams?.callbackUrl || '/dashboard';
  
  if (session?.user?.id) redirect(callbackUrl);
  
  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Create account</h1>
      <p className="text-text-secondary text-sm mb-8">Takes 10 seconds. No email confirmation needed for local use.</p>
      <RegisterForm callbackUrl={callbackUrl} />
    </main>
  );
}
