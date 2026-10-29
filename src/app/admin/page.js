import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Game from '@/models/Game';
import MatchResult from '@/models/MatchResult';
import AdminGameRow from './AdminGameRow';
import AdminUserRow from './AdminUserRow';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  
  // Strict Server-side Authorization
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  await connectDB();
  
  const totalUsers = await User.countDocuments();
  const totalGames = await Game.countDocuments();
  const totalMatches = await MatchResult.countDocuments();
  
  const users = await User.find().sort({ createdAt: -1 }).limit(20).lean();
  const games = await Game.find().sort({ createdAt: -1 }).lean();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1 text-violet-soft">Admin Control Center</h1>
        <p className="text-text-secondary text-sm">Manage platform data, users, and game visibility.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="surface p-4 text-center">
          <div className="text-text-secondary text-xs mb-1">TOTAL USERS</div>
          <div className="font-display text-2xl font-bold">{totalUsers}</div>
        </div>
        <div className="surface p-4 text-center">
          <div className="text-text-secondary text-xs mb-1">TOTAL GAMES</div>
          <div className="font-display text-2xl font-bold">{totalGames}</div>
        </div>
        <div className="surface p-4 text-center">
          <div className="text-text-secondary text-xs mb-1">MATCHES PLAYED</div>
          <div className="font-display text-2xl font-bold text-cyan">{totalMatches}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-xl font-bold mb-4">User Management</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Username</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <AdminUserRow 
                    key={u._id} 
                    user={JSON.parse(JSON.stringify(u))} 
                    currentAdminId={session.user.id} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold mb-4">Game Catalog</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Game Name</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => <AdminGameRow key={g._id} game={JSON.parse(JSON.stringify(g))} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
