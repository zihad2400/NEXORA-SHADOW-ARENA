import Link from 'next/link';
import Button from '@/components/ui/Button';
import { connectDB } from '@/lib/mongodb';
import Game from '@/models/Game';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await connectDB();
  const featuredGames = await Game.find({ published: true, featured: true }).limit(3).lean();
  const totalGames = await Game.countDocuments({ published: true });

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-violet/30 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-cyan/20 blur-3xl animate-pulse-slow" />
        </div>
        
        {/* Adjusted padding and text sizes for mobile */}
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-28 text-center animate-fade-up">
          <div className="badge-nexora mb-6 inline-block">SHADOW ARENA · {totalGames} GAMES LIVE</div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-gradient glow-text block mb-2">ENTER THE DARK.</span>
            <span className="text-text-primary block">MASTER THE ARENA.</span>
          </h1>
          
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto mb-10">
            A premium browser arcade with {totalGames} original games, persistent progression,
            and leaderboards that matter. No downloads. No pay-to-win. Just skill.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button href="/register" className="text-base px-7 py-3 w-full sm:w-auto">PLAY NOW</Button>
            <Button href="/games" variant="ghost" className="text-base px-7 py-3 w-full sm:w-auto">Browse games</Button>
          </div>
        </div>
      </section>

      {/* FEATURED (DYNAMIC) */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2">Featured games</h2>
            <p className="text-text-secondary text-sm">Hand-picked from the arena.</p>
          </div>
          <Link href="/games" className="text-violet-soft text-sm hover:underline">See all {totalGames} games →</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredGames.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="surface card-hover overflow-hidden group"
            >
              <img src={g.thumbnail} alt="" className="w-full aspect-[5/3] object-cover" />
              <div className="p-5">
                <div className="badge-nexora mb-2 uppercase">{g.category}</div>
                <div className="font-display text-lg font-semibold group-hover:text-violet-soft transition">{g.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <h2 className="font-display text-2xl font-bold mb-8">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '01', t: 'Create an account', d: 'Username, email, password. No email verification required for local use.' },
            { n: '02', t: 'Pick a game', d: 'Each game has real mechanics and clear scoring. Play with keyboard or touch.' },
            { n: '03', t: 'Climb the board', d: 'Every validated match earns XP and coins. Your best score per game ranks you.' },
          ].map((s) => (
            <div key={s.n} className="surface p-6">
              <div className="text-violet-soft font-mono text-sm mb-2">{s.n}</div>
              <div className="font-display font-semibold mb-2">{s.t}</div>
              <div className="text-text-secondary text-sm">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h2 className="font-display text-2xl font-bold mb-8">FAQ</h2>
        <div className="space-y-4">
          {[
            { q: 'Are the games real?', a: 'Yes. All games are fully playable in the browser.' },
            { q: 'Is anything pay-to-win?', a: 'No. Coins are earned from playing. There is no real-money purchase.' },
            { q: 'How are leaderboards calculated?', a: 'From validated match results stored in the database. Best score per player per game, with earlier achieved times winning ties.' },
            { q: 'Where is data stored?', a: 'In your local MongoDB during development. See the README for production setup.' },
          ].map((f) => (
            <details key={f.q} className="surface p-4 group">
              <summary className="cursor-pointer font-semibold flex justify-between items-center text-sm md:text-base">
                {f.q}
                <span className="text-violet-soft group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-text-secondary text-sm">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
