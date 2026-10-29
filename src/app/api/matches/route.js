import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { submitMatch } from '@/services/rewardService';
import { evaluateAchievements } from '@/services/achievementService';
import { recordMatchProgress } from '@/services/challengeService';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Sign in required', 401);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON', 400); }

  const { sessionId, gameSlug, score, durationMs, metrics } = body;
  if (!sessionId || !gameSlug) return jsonError('VALIDATION', 'Missing fields', 400);

  try {
    await connectDB();
    
    // 1. Submit and validate
    const result = await submitMatch({
      userId: session.user.id,
      sessionId,
      gameSlug,
      score: Number(score),
      durationMs: Number(durationMs),
      metrics: metrics || {},
    });

    // 2. Update achievements & challenges
    const newAchievements = await evaluateAchievements(session.user.id);
    await recordMatchProgress(session.user.id, { gameSlug, score: Number(score) });

    return jsonOk({
      match: { id: String(result.match._id), score: result.match.score },
      user: { xp: result.user.xp, coins: result.user.coins, level: result.user.level },
      newAchievements: newAchievements.length,
    });
  } catch (err) {
    console.error('[matches]', err);
    if (err.code === 'CONFLICT') return jsonError('CONFLICT', err.message, 409);
    if (err.code === 'VALIDATION') return jsonError('VALIDATION', err.message, 400);
    if (err.code === 'NOT_FOUND') return jsonError('NOT_FOUND', err.message, 404);
    return jsonError('INTERNAL', 'Failed to submit match', 500);
  }
}
