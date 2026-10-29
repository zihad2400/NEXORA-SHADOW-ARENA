import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { findUserById } from '@/services/userService';
import PlayerStats from '@/models/PlayerStats';
import Game from '@/models/Game';
import MatchResult from '@/models/MatchResult';
import { levelFromXP } from '@/lib/constants';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login');

  await connectDB();
  const user = await findUserById(session.user.id);
  if (!user) redirect('/login');

  const stats = await PlayerStats.findOne({ user: user._id }).lean();
  const lvl = levelFromXP(user.xp);

  // Safely parse bestByGame (handling both Map and plain object)
  let bestScores = {};
  if (stats?.bestByGame) {
    if (stats.bestByGame instanceof Map) {
      bestScores = Object.fromEntries(stats.bestByGame);
    } else {
      bestScores = stats.bestByGame;
    }
  }

  // Get recent matches
  const recentMatches = await MatchResult.find({ user: user._id })
    .sort({ completedAt: -1 })
    .limit(5)
    .populate('game', 'name slug')
    .lean();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-text-secondary text-sm">Welcome back</div>
          <h1 className="font-display text-3xl font-bold">{user.username}</h1>
        </div>
        <div className="flex gap-2">
          <Button href="/profile" variant="ghost" className="text-sm px-4 py-2">Profile</Button>
          <Button href="/games" className="text-sm px-4 py-2">Play</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="surface p-5">
          <div className="text-xs text-text-secondary mb-1">LEVEL</div>
          <div className="font-display text-3xl font-bold">{user.level}</div>
          <ProgressBar value={lvl.xpIntoLevel} max={lvl.xpForNext} className="mt-3" />
          <div className="text-xs text-text-secondary mt-2">
            {lvl.xpIntoLevel} / {lvl.xpForNext} XP
          </div>
        </div>
        <div className="surface p-5">
          <div className="text-xs text-text-secondary mb-1">COINS</div>
          <div className="font-display text-3xl font-bold text-warning">{user.coins}</div>
        </div>
        <div className="surface p-5">
          <div className="text-xs text-text-secondary mb-1">TOTAL SCORE</div>
          <div className="font-display text-3xl font-bold text-cyan">{stats?.totalValidatedScore ?? 0}</div>
        </div>
        <div className="surface p-5">
          <div className="text-xs text-text-secondary mb-1">MATCHES</div>
          <div className="font-display text-3xl font-bold">{stats?.matchesPlayed ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface p-6">
          <h2 className="font-display font-semibold mb-4">Quick Play</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { s: 'neon-dodge', n: 'Neon Dodge' },
              { s: 'shadow-reflex', n: 'Shadow Reflex' },
              { s: 'cyber-memory', n: 'Cyber Memory' },
              { s: 'neon-snake', n: 'Neon Snake' },
            ].map((g) => (
              <Link
                key={g.s}
                href={`/play/${g.s}`}
                className="surface bg-bg-elevated p-3 text-center text-sm hover:border-violet transition font-medium"
              >
                {g.n}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="surface p-6">
          <h2 className="font-display font-semibold mb-4">Your best scores</h2>
          {Object.keys(bestScores).length > 0 ? (
            <ul className="space-y-2 text-sm">
              {Object.entries(bestScores).map(([slug, score]) => (
                <li key={slug} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-text-secondary capitalize">{slug.replace('-', ' ')}</span>
                  <span className="font-mono text-cyan">{score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">No matches yet. Play to set your first record.</p>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="mt-6">
        <h2 className="font-display font-semibold mb-4 text-xl">Recent Matches</h2>
        {recentMatches.length > 0 ? (
          <div className="surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Game</th>
                  <th className="text-right px-4 py-3">Score</th>
                  <th className="text-right px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((m) => (
                  <tr key={m._id} className="border-t border-border">
                    <td className="px-4 py-3">{m.game?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan">{m.score}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">
                      {new Date(m.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-secondary text-sm">No recent matches.</p>
        )}
      </div>
    </main>
  );
}
