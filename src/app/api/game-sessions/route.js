import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { getGameBySlug, createSession } from '@/services/gameService';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Sign in to play', 401);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON', 400); }

  const { gameSlug } = body;
  if (!gameSlug) return jsonError('VALIDATION', 'gameSlug required', 400);

  try {
    await connectDB();
    const game = await getGameBySlug(gameSlug);
    if (!game) return jsonError('NOT_FOUND', 'Game not found', 404);

    const gameSession = await createSession({ userId: session.user.id, gameDoc: game });
    return jsonOk({ sessionId: gameSession.sessionId, seed: gameSession.seed });
  } catch (err) {
    console.error('[game-sessions]', err);
    return jsonError('INTERNAL', 'Failed to create session', 500);
  }
}
