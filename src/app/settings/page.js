import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { findUserById } from '@/services/userService';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=/settings');

  await connectDB();
  const user = await findUserById(session.user.id);
  if (!user) redirect('/login');

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your profile, game preferences, and account security.</p>
      </div>
      <SettingsForm user={JSON.parse(JSON.stringify(user))} />
    </main>
  );
}
