import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { getGameBySlug } from '@/services/gameService';
import { getSession } from '@/lib/auth';
import { getUserRankForGame } from '@/services/leaderboardService';
import Button from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function GameDetailPage({ params }) {
  await connectDB();
  const game = await getGameBySlug(params.slug);
  if (!game) notFound();

  const session = await getSession();
  const userId = session?.user?.id;
  const rank = userId ? await getUserRankForGame({ userId, gameSlug: game.slug }) : null;

  // Dynamic routing: If signed in, play. If not, login with callback.
  const playUrl = userId ? `/play/${game.slug}` : `/login?callbackUrl=/play/${game.slug}`;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/games" className="text-text-secondary text-sm hover:text-text-primary">← All games</Link>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <div className="surface overflow-hidden">
            <img src={game.thumbnail} alt="" className="w-full aspect-[5/3] object-cover" />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex gap-2 mb-3">
            <span className="badge-nexora uppercase">{game.category}</span>
            <span className="text-xs text-text-secondary border border-border rounded-full px-2 py-0.5">{game.difficulty}</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">{game.name}</h1>
          <p className="text-text-secondary text-sm mb-6">{game.description}</p>

          {rank && (
            <div className="surface p-4 mb-4 text-sm">
              <div className="text-text-secondary text-xs mb-1">YOUR BEST</div>
              <div className="font-display text-xl">{rank.score}</div>
              <div className="text-xs text-text-secondary mt-1">Rank #{rank.rank} of {rank.total}</div>
            </div>
          )}

          <Button href={playUrl} className="w-full mb-2">
            {userId ? 'Play now' : 'Sign in to play'}
          </Button>
          <p className="text-xs text-text-secondary text-center">
            {userId ? 'Progress is saved automatically.' : 'Sign in takes 10 seconds.'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <div className="surface p-6">
          <h2 className="font-display font-semibold mb-3">Instructions</h2>
          <p className="text-text-secondary text-sm whitespace-pre-line">{game.instructions || 'No instructions provided.'}</p>
        </div>
        <div className="surface p-6">
          <h2 className="font-display font-semibold mb-3">Controls</h2>
          <p className="text-text-secondary text-sm whitespace-pre-line">{game.controls || 'Keyboard and touch supported.'}</p>
        </div>
      </div>
    </main>
  );
}
