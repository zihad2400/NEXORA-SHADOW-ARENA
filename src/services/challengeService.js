import DailyChallenge from '@/models/DailyChallenge';
import UserChallenge from '@/models/UserChallenge';

export function todayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function todayKey() {
  return todayUTC().toISOString().slice(0, 10);
}

export async function ensureDailyChallengesForToday() {
  const dateKey = todayKey();
  const existing = await DailyChallenge.find({ dateKey }).lean();
  if (existing.length) return existing;

  const templates = [
    { type: 'play_matches', title: 'Warm-up', description: 'Play 3 matches today', target: 3, xpReward: 20, coinReward: 10 },
    { type: 'score_in_game', gameSlug: 'neon-dodge', title: 'Survivor', description: 'Score 200+ in Neon Dodge', target: 200, xpReward: 30, coinReward: 15 },
    { type: 'play_game', gameSlug: 'cyber-memory', title: 'Remember', description: 'Complete a Cyber Memory game', target: 1, xpReward: 25, coinReward: 10 },
  ];

  const docs = templates.map((t, i) => ({
    key: `${dateKey}:${t.type}:${i}`,
    dateKey,
    title: t.title,
    description: t.description,
    type: t.type,
    gameSlug: t.gameSlug,
    target: t.target,
    xpReward: t.xpReward,
    coinReward: t.coinReward,
  }));

  await DailyChallenge.insertMany(docs, { ordered: false }).catch(() => {});
  return DailyChallenge.find({ dateKey }).lean();
}

export async function recordMatchProgress(userId, { gameSlug, score }) {
  // Ensure challenges exist in DB before recording
  await ensureDailyChallengesForToday();
  
  const dateKey = todayKey();
  const challenges = await DailyChallenge.find({ dateKey }).lean();
  
  for (const c of challenges) {
    let shouldUpdate = false;
    let updateQuery = {};

    if (c.type === 'play_matches') {
      shouldUpdate = true;
      updateQuery = { $inc: { progress: 1 }, $setOnInsert: { dateKey } };
    } 
    else if (c.type === 'play_game' && c.gameSlug === gameSlug) {
      shouldUpdate = true;
      updateQuery = { $inc: { progress: 1 }, $setOnInsert: { dateKey } };
    } 
    else if (c.type === 'score_in_game' && c.gameSlug === gameSlug) {
      // Only update if the new score is higher than the current progress
      const current = await UserChallenge.findOne({ user: userId, challenge: c._id });
      if (!current || current.progress < score) {
        shouldUpdate = true;
        updateQuery = { $set: { progress: score }, $setOnInsert: { dateKey } };
      }
    }

    if (shouldUpdate) {
      await UserChallenge.findOneAndUpdate(
        { user: userId, challenge: c._id },
        updateQuery,
        { upsert: true }
      );

      // Check if completed after update
      const uc = await UserChallenge.findOne({ user: userId, challenge: c._id });
      if (uc && !uc.completed && uc.progress >= c.target) {
        uc.completed = true;
        await uc.save();
      }
    }
  }
}
