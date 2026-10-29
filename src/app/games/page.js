import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import { listPublishedGames } from '@/services/gameService';
import EmptyState from '@/components/ui/EmptyState';
import GamesFilter from '@/components/games/GamesFilter';

export const dynamic = 'force-dynamic';

export default async function GamesPage({ searchParams }) {
  await connectDB();
  const q = searchParams?.q || '';
  const category = searchParams?.category || 'all';
  const difficulty = searchParams?.difficulty || 'all';
  const sort = searchParams?.sort || 'featured';

  const games = await listPublishedGames({ q, category, difficulty, sort });

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-2">Games</h1>
        <p className="text-text-secondary text-sm">{games.length} {games.length === 1 ? 'game' : 'games'} found</p>
      </div>

      {/* The new dynamic filter component */}
      <GamesFilter />

      {games.length === 0 ? (
        <EmptyState
          title="No games match your search"
          message="Try clearing filters or a different query."
          action={<Link href="/games" className="btn-ghost-nexora text-sm px-4 py-2">Reset filters</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <Link
              key={g._id}
              href={`/games/${g.slug}`}
              className="surface card-hover overflow-hidden group"
            >
              <img src={g.thumbnail} alt="" className="w-full aspect-[5/3] object-cover" />
              <div className="p-5">
                <div className="flex gap-2 mb-2">
                  <span className="badge-nexora">{g.category}</span>
                  <span className="text-xs text-text-secondary border border-border rounded-full px-2 py-0.5">{g.difficulty}</span>
                </div>
                <div className="font-display text-lg font-semibold group-hover:text-violet-soft transition">{g.name}</div>
                <p className="text-text-secondary text-sm mt-1 line-clamp-2">{g.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
