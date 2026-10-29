import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';
import UserChallenge from '@/models/UserChallenge';
import DailyChallenge from '@/models/DailyChallenge';
import User from '@/models/User';
import RewardTransaction from '@/models/RewardTransaction';
import { levelFromXP } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Sign in required', 401);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON', 400); }

  const { challengeId } = body;
  if (!challengeId) return jsonError('VALIDATION', 'challengeId required', 400);

  try {
    await connectDB();

    const challenge = await DailyChallenge.findById(challengeId);
    if (!challenge) return jsonError('NOT_FOUND', 'Challenge not found', 404);

    const userChallenge = await UserChallenge.findOne({ 
      user: session.user.id, 
      challenge: challenge._id 
    });

    if (!userChallenge) return jsonError('NOT_FOUND', 'Progress not found', 404);
    if (userChallenge.progress < challenge.target) return jsonError('VALIDATION', 'Challenge not complete', 400);
    if (userChallenge.claimed) return jsonError('CONFLICT', 'Already claimed', 400);

    // Idempotency Key to prevent double processing
    const idempotencyKey = `challenge:${challenge._id}:${session.user.id}`;

    // Check if already claimed via transaction (race condition prevention)
    const existingTx = await RewardTransaction.findOne({ idempotencyKey });
    if (existingTx) return jsonError('CONFLICT', 'Already claimed', 400);

    // Mark as claimed
    userChallenge.claimed = true;
    userChallenge.claimedAt = new Date();
    await userChallenge.save();

    // Give Rewards
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { xp: challenge.xpReward, coins: challenge.coinReward } },
      { new: true }
    );

    // Recalculate level
    const { level } = levelFromXP(updatedUser.xp);
    if (level !== updatedUser.level) {
      updatedUser.level = level;
      await updatedUser.save();
    }

    // Log transaction
    await RewardTransaction.create({
      user: session.user.id,
      type: 'challenge',
      xpDelta: challenge.xpReward,
      coinDelta: challenge.coinReward,
      reason: `Completed challenge: ${challenge.title}`,
      idempotencyKey,
    });

    return jsonOk({ 
      message: 'Reward claimed', 
      xp: challenge.xpReward, 
      coins: challenge.coinReward 
    });

  } catch (err) {
    console.error('[challenges/claim]', err);
    return jsonError('INTERNAL', 'Failed to claim reward', 500);
  }
}
