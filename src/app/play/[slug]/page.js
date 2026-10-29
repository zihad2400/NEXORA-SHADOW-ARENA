import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { getGameBySlug } from '@/services/gameService';
import { getSession } from '@/lib/auth';
import GameShell from '@/components/games/GameShell';
import Link from 'next/link';

// Imports
import NeonDodge from '@/components/games/NeonDodge';
import ShadowReflex from '@/components/games/ShadowReflex';
import CyberMemory from '@/components/games/CyberMemory';
import NeonSnake from '@/components/games/NeonSnake';
import BlockBreaker from '@/components/games/BlockBreaker';
import Cyber2048 from '@/components/games/Cyber2048';
import ReactionGrid from '@/components/games/ReactionGrid';
import MemoryFlip from '@/components/games/MemoryFlip';
import AsteroidHunter from '@/components/games/AsteroidHunter';
import ColorMatch from '@/components/games/ColorMatch';
import CyberRunner from '@/components/games/CyberRunner';
import TowerStack from '@/components/games/TowerStack';
import ReflexDash from '@/components/games/ReflexDash';

export const dynamic = 'force-dynamic';

export default async function PlayPage({ params }) {
  const session = await getSession();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/play/${params.slug}`);

  await connectDB();
  const game = await getGameBySlug(params.slug);
  if (!game) notFound();

  // Safe map
  let gameComponent;
  switch (game.slug) {
    case 'neon-dodge': gameComponent = <NeonDodge />; break;
    case 'shadow-reflex': gameComponent = <ShadowReflex />; break;
    case 'cyber-memory': gameComponent = <CyberMemory />; break;
    case 'neon-snake': gameComponent = <NeonSnake />; break;
    case 'block-breaker': gameComponent = <BlockBreaker />; break;
    case 'cyber-2048': gameComponent = <Cyber2048 />; break;
    case 'reaction-grid': gameComponent = <ReactionGrid />; break;
    case 'memory-flip': gameComponent = <MemoryFlip />; break;
    case 'asteroid-hunter': gameComponent = <AsteroidHunter />; break;
    case 'color-match': gameComponent = <ColorMatch />; break;
    case 'cyber-runner': gameComponent = <CyberRunner />; break;
    case 'tower-stack': gameComponent = <TowerStack />; break;
    case 'reflex-dash': gameComponent = <ReflexDash />; break;
    default:
      gameComponent = (
        <div className="surface-elevated p-12 text-center rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
          <p className="text-text-secondary mb-8">This game is coming soon to the arena.</p>
          <Link href="/games" className="btn-nexora">Browse other games</Link>
        </div>
      );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/games/${game.slug}`} className="text-sm text-text-secondary hover:text-text-primary">← Back to details</Link>
          <h1 className="font-display text-3xl font-bold mt-2">{game.name}</h1>
        </div>
      </div>

      <GameShell game={game}>
        {gameComponent}
      </GameShell>
    </main>
  );
}
