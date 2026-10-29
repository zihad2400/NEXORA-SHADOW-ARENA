import RewardTransaction from '@/models/RewardTransaction';
import User from '@/models/User';
import PlayerStats from '@/models/PlayerStats';
import MatchResult from '@/models/MatchResult';
import GameSession from '@/models/GameSession';
import Game from '@/models/Game';
import { REWARDS, levelFromXP, SESSION_LIMITS } from '@/lib/constants';

export async function submitMatch({ userId, sessionId, gameSlug, score, durationMs, metrics = {} }) {
  if (!Number.isFinite(score) || score < 0 || score > 1e9) {
    const e = new Error('Invalid score'); e.code = 'VALIDATION'; throw e;
  }
  if (!Number.isFinite(durationMs) || durationMs < 200) {
    const e = new Error('Duration too short'); e.code = 'VALIDATION'; throw e;
  }

  const game = await Game.findOne({ slug: gameSlug }).lean();
  if (!game) { const e = new Error('Game not found'); e.code = 'NOT_FOUND'; throw e; }

  const maxDur =
    gameSlug === 'neon-dodge' ? SESSION_LIMITS.NEON_DODGE_MAX_DURATION_MS :
    gameSlug === 'shadow-reflex' ? SESSION_LIMITS.REFLEX_MAX_DURATION_MS :
    SESSION_LIMITS.MEMORY_HARD_MAX_MS;

  if (durationMs > maxDur + 5000) {
    const e = new Error('Duration exceeds maximum'); e.code = 'VALIDATION'; throw e;
  }

  if (gameSlug === 'neon-dodge' && score > durationMs / 50) {
    const e = new Error('Score implausible for duration'); e.code = 'VALIDATION'; throw e;
  }
  if (gameSlug === 'shadow-reflex' && (score < 30 || score > 5000)) {
    const e = new Error('Reaction time out of bounds'); e.code = 'VALIDATION'; throw e;
  }

  const session = await GameSession.findOne({ sessionId, user: userId, game: game._id });
  if (!session) { const e = new Error('Session not found'); e.code = 'NOT_FOUND'; throw e; }
  if (session.state !== 'active') { const e = new Error('Session already used'); e.code = 'CONFLICT'; throw e; }
  if (session.expiresAt.getTime() < Date.now()) {
    session.state = 'expired'; await session.save();
    const e = new Error('Session expired'); e.code = 'CONFLICT'; throw e;
  }

  const completedAt = new Date();
  session.state = 'completed';
  session.completedAt = completedAt;
  session.submissionState = 'submitted';
  await session.save();

  let matchDoc;
  try {
    matchDoc = await MatchResult.create({
      user: userId,
      game: game._id,
      sessionId,
      score: Math.floor(score),
      durationMs: Math.floor(durationMs),
      metrics,
      completedAt,
      verification: 'validated',
    });
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error('Match already submitted for this session');
      e.code = 'CONFLICT'; throw e;
    }
    throw err;
  }

  const xpGain = REWARDS.XP_PER_MATCH_BASE + Math.min(50, Math.floor(score / 20));
  const coinGain = REWARDS.COINS_PER_MATCH;
  const rewardKey = `match:${sessionId}`;

  try {
    await RewardTransaction.create({
      user: userId,
      type: 'match',
      xpDelta: xpGain,
      coinDelta: coinGain,
      reason: `Match on ${gameSlug}`,
      idempotencyKey: rewardKey,
    });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: xpGain, coins: coinGain } },
    { new: true }
  );
  const lvl = levelFromXP(updatedUser.xp).level;
  if (lvl !== updatedUser.level) {
    await User.updateOne({ _id: userId }, { $set: { level: lvl } });
    updatedUser.level = lvl;
  }

  const stats = await PlayerStats.findOneAndUpdate(
    { user: userId },
    {
      $inc: { totalValidatedScore: Math.floor(score), matchesPlayed: 1 },
      $addToSet: { gamesCompleted: gameSlug },
    },
    { new: true, upsert: true }
  );

  const prevBest = stats.bestByGame?.get(gameSlug) || 0;
  if (Math.floor(score) > prevBest) {
    stats.bestByGame.set(gameSlug, Math.floor(score));
    await stats.save();
  }

  return { match: matchDoc, user: updatedUser, stats };
}
