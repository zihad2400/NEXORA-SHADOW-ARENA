import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { findUserById } from '@/services/userService';
import PlayerStats from '@/models/PlayerStats';
import MatchResult from '@/models/MatchResult';
import Game from '@/models/Game';
import ProgressBar from '@/components/ui/ProgressBar';
import { levelFromXP } from '@/lib/constants';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=/profile');

  await connectDB();
  const user = await findUserById(session.user.id);
  if (!user) redirect('/login');

  // Need Game model loaded for populate
  const stats = await PlayerStats.findOne({ user: user._id }).lean();
  const recent = await MatchResult.find({ user: user._id })
    .sort({ completedAt: -1 })
    .limit(5)
    .populate('game', 'name slug')
    .lean();

  const lvl = levelFromXP(user.xp);
  
  // Safe parse bestByGame
  let bestScores = [];
  if (stats?.bestByGame) {
    const rawMap = stats.bestByGame instanceof Map ? Object.fromEntries(stats.bestByGame) : stats.bestByGame;
    // We need to fetch game names for these slugs
    const gameSlugs = Object.keys(rawMap);
    const gamesData = await Game.find({ slug: { $in: gameSlugs } }).lean();
    const gameNameMap = gamesData.reduce((acc, g) => ({ ...acc, [g.slug]: g.name }), {});
    
    bestScores = Object.entries(rawMap).map(([slug, score]) => ({
      slug,
      name: gameNameMap[slug] || slug,
      score
    })).sort((a, b) => b.score - a.score);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="surface-elevated p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet/20 to-cyan/20 -z-10" />
        
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-bg-card border-4 border-bg-base flex items-center justify-center text-4xl shadow-card -mt-12 md:mt-0 z-10">
          {user.avatar === 'default' ? user.username.charAt(0).toUpperCase() : user.avatar}
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="font-display text-3xl font-bold">{user.username}</h1>
          <div className="text-text-secondary text-sm mb-3">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="badge-nexora">Level {user.level}</span>
            <span className="badge-nexora text-warning">{user.coins} Coins</span>
            <span className="badge-nexora text-cyan">{user.xp} Total XP</span>
          </div>
        </div>
        
        <div className="z-10">
          <Button href="/settings" variant="ghost" className="text-sm px-6 py-2">Edit Profile</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="surface p-5 flex flex-col justify-center">
          <div className="text-text-secondary text-xs mb-1">LEVEL PROGRESS</div>
          <div className="font-display text-2xl font-bold mb-2">{lvl.level}</div>
          <ProgressBar value={lvl.xpIntoLevel} max={lvl.xpForNext} />
          <div className="text-xs text-text-secondary mt-2">{lvl.xpIntoLevel} / {lvl.xpForNext} XP</div>
        </div>
        <div className="surface p-5 flex flex-col justify-center text-center">
          <div className="text-text-secondary text-xs mb-1">TOTAL SCORE</div>
          <div className="font-display text-3xl font-bold text-cyan">{stats?.totalValidatedScore ?? 0}</div>
        </div>
        <div className="surface p-5 flex flex-col justify-center text-center">
          <div className="text-text-secondary text-xs mb-1">MATCHES PLAYED</div>
          <div className="font-display text-3xl font-bold">{stats?.matchesPlayed ?? 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Best Scores */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Personal Bests</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Game</th>
                  <th className="text-right px-4 py-3">Best Score</th>
                </tr>
              </thead>
              <tbody>
                {bestScores.length > 0 ? bestScores.map((b) => (
                  <tr key={b.slug} className="border-t border-border hover:bg-bg-elevated/30">
                    <td className="px-4 py-3">
                      <Link href={`/play/${b.slug}`} className="hover:text-violet-soft font-medium">
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan">{b.score}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-text-secondary">No scores yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Matches */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Recent Matches</h2>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3">Game</th>
                  <th className="text-right px-4 py-3">Score</th>
                  <th className="text-right px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.length > 0 ? recent.map((m) => (
                  <tr key={m._id} className="border-t border-border">
                    <td className="px-4 py-3">{m.game?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan">{m.score}</td>
                    <td className="px-4 py-3 text-right text-text-secondary text-xs">{new Date(m.completedAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-text-secondary">No matches yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
