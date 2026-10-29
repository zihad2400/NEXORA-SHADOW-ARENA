import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Game from '@/models/Game';
import { getGameLeaderboard } from '@/services/leaderboardService';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ searchParams }) {
  await connectDB();
  
  // 1. Fetch all published games for the dynamic tabs
  const games = await Game.find({ published: true }).sort({ createdAt: 1 }).lean();
  
  // 2. Determine which game is selected (default to the first one)
  const activeGameSlug = searchParams?.game || (games.length > 0 ? games[0].slug : null);
  
  if (!activeGameSlug || games.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-text-secondary text-sm mb-6">No games available yet.</p>
        <EmptyState title="No games" message="Check back later." />
      </main>
    );
  }

  // 3. Pagination logic
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = 25;
  
  // 4. Fetch leaderboard data for the selected game
  const data = await getGameLeaderboard({ gameSlug: activeGameSlug, page, pageSize });
  const activeGame = games.find(g => g.slug === activeGameSlug) || games[0];

  // 5. Helper for pagination links
  const createQueryString = (name, value) => {
    const params = new URLSearchParams();
    params.set('game', activeGameSlug);
    if (value) params.set(name, value.toString());
    return `/leaderboard?${params.toString()}`;
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Leaderboard</h1>
      <p className="text-text-secondary text-sm mb-6">Best validated score per player per game.</p>

      {/* Dynamic Game Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {games.map((g) => {
          const isActive = g.slug === activeGameSlug;
          return (
            <Link
              key={g.slug}
              href={`/leaderboard?game=${g.slug}`}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-violet text-text-primary shadow-glow-violet' 
                  : 'border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
            >
              {g.name}
            </Link>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      {data.items.length === 0 ? (
        <EmptyState
          title={`No scores yet for ${activeGame.name}`}
          message="Be the first to place a record in this game."
          action={<Link href={`/play/${activeGame.slug}`} className="btn-nexora text-sm px-4 py-2">Play Now</Link>}
        />
      ) : (
        <>
          <div className="surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-elevated text-text-secondary">
                <tr>
                  <th className="text-left px-4 py-3 w-16">Rank</th>
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-right px-4 py-3">Level</th>
                  <th className="text-right px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.userId} className="border-t border-border hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3 text-text-secondary font-mono">#{r.rank}</td>
                    <td className="px-4 py-3">
                      <Link href={`/profile/${r.username}`} className="font-medium hover:text-violet-soft transition">
                        {r.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary">Lvl {r.level}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan font-bold">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > pageSize && (
            <div className="flex justify-between items-center mt-6">
              {page > 1 ? (
                <Link href={createQueryString('page', page - 1)} className="btn-ghost-nexora text-sm px-4 py-2">
                  ← Previous
                </Link>
              ) : (
                <button disabled className="btn-ghost-nexora text-sm px-4 py-2 opacity-50 cursor-not-allowed">
                  ← Previous
                </button>
              )}
              
              <span className="text-text-secondary text-sm">
                Page {page} of {Math.ceil(data.total / pageSize)}
              </span>

              {page * pageSize < data.total ? (
                <Link href={createQueryString('page', page + 1)} className="btn-ghost-nexora text-sm px-4 py-2">
                  Next →
                </Link>
              ) : (
                <button disabled className="btn-ghost-nexora text-sm px-4 py-2 opacity-50 cursor-not-allowed">
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
