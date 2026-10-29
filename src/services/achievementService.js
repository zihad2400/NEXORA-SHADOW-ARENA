import Achievement from '@/models/Achievement';
import UserAchievement from '@/models/UserAchievement';
import PlayerStats from '@/models/PlayerStats';
import User from '@/models/User';

export async function evaluateAchievements(userId) {
  const [achievements, stats, user, unlocked] = await Promise.all([
    Achievement.find({}).lean(),
    PlayerStats.findOne({ user: userId }).lean(),
    User.findById(userId).lean(),
    UserAchievement.find({ user: userId }).lean(),
  ]);
  if (!stats || !user) return [];

  const unlockedIds = new Set(unlocked.map((u) => String(u.achievement)));
  const newlyUnlocked = [];

  for (const ach of achievements) {
    if (unlockedIds.has(String(ach._id))) continue;
    const cond = ach.condition || {};
    let met = false;
    if (cond.type === 'matches_played') met = stats.matchesPlayed >= cond.threshold;
    else if (cond.type === 'total_score') met = stats.totalValidatedScore >= cond.threshold;
    else if (cond.type === 'game_best_score' && cond.gameSlug) {
      const best = stats.bestByGame?.get?.(cond.gameSlug) ?? stats.bestByGame?.[cond.gameSlug] ?? 0;
      met = best >= cond.threshold;
    } else if (cond.type === 'level_reached') met = user.level >= cond.threshold;

    if (met) {
      try {
        const ua = await UserAchievement.create({ user: userId, achievement: ach._id });
        newlyUnlocked.push({ achievement: ach, ua });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }
  return newlyUnlocked;
}
