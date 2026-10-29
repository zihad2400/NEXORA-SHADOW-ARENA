import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Achievement from '@/models/Achievement';
import UserAchievement from '@/models/UserAchievement';
import PlayerStats from '@/models/PlayerStats';
import User from '@/models/User';
import ProgressBar from '@/components/ui/ProgressBar';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=/achievements');

  await connectDB();
  
  const [allAchievements, unlockedList, stats, user] = await Promise.all([
    Achievement.find({}).lean(),
    UserAchievement.find({ user: session.user.id }).lean(),
    PlayerStats.findOne({ user: session.user.id }).lean(),
    User.findById(session.user.id).lean()
  ]);

  const unlockedMap = new Map(unlockedList.map(u => [String(u.achievement), u]));

  const getProgress = (ach) => {
    if (unlockedMap.has(String(ach._id))) {
      return { current: ach.condition.threshold, target: ach.condition.threshold, isUnlocked: true };
    }
    
    let current = 0;
    const cond = ach.condition || {};
    
    if (cond.type === 'matches_played') current = stats?.matchesPlayed || 0;
    else if (cond.type === 'total_score') current = stats?.totalValidatedScore || 0;
    else if (cond.type === 'level_reached') current = user?.level || 1;
    else if (cond.type === 'game_best_score' && cond.gameSlug) {
      const best = stats?.bestByGame?.get?.(cond.gameSlug) ?? stats?.bestByGame?.[cond.gameSlug] ?? 0;
      current = best;
    }

    return { 
      current: Math.min(current, cond.threshold), 
      target: cond.threshold, 
      isUnlocked: current >= cond.threshold 
    };
  };

  const categories = ['gameplay', 'progression', 'special'];
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = allAchievements.filter(a => a.category === cat);
    return acc;
  }, {});

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-text-secondary text-sm">Track your milestones and unlock exclusive rewards.</p>
      </div>

      {allAchievements.length === 0 ? (
        <div className="surface p-8 text-center text-text-secondary">
          No achievements configured yet. Run the seed script.
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(cat => {
            const list = grouped[cat];
            if (!list || list.length === 0) return null;

            return (
              <section key={cat}>
                <h2 className="font-display text-xl font-bold mb-4 capitalize text-text-primary border-b border-border pb-2">
                  {cat} Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {list.map((ach) => {
                    const { current, target, isUnlocked } = getProgress(ach);
                    
                    return (
                      <div 
                        key={ach._id} 
                        className={`surface p-4 sm:p-5 flex flex-col justify-between transition-all ${
                          isUnlocked ? 'border-violet/40 bg-violet/5 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'opacity-80'
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shrink-0 ${
                            isUnlocked ? 'bg-violet/20 text-violet-soft shadow-glow-violet' : 'bg-bg-elevated text-text-secondary'
                          }`}>
                            {isUnlocked ? '🏆' : '🔒'}
                          </div>
                          
                          <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow */}
                            
                            {/* Title and Unlocked Badge - flex-wrap for small screens */}
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                              <div className="font-display font-semibold text-base sm:text-lg break-words">{ach.name}</div>
                              {isUnlocked && (
                                <span className="text-[10px] sm:text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded shrink-0">
                                  UNLOCKED
                                </span>
                              )}
                            </div>
                            
                            <p className="text-text-secondary text-sm mb-4">{ach.description}</p>
                            
                            {/* Progress Bar */}
                            {!isUnlocked && target > 1 && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center text-xs text-text-secondary mb-1 gap-2">
                                  <span>Progress</span>
                                  <span className="shrink-0 font-mono">{current} / {target}</span>
                                </div>
                                <ProgressBar value={current} max={target} />
                              </div>
                            )}
                            
                            {/* Rewards */}
                            <div className="flex flex-wrap gap-2">
                              <span className="badge-nexora text-[10px] sm:text-xs whitespace-nowrap">+{ach.xpReward} XP</span>
                              <span className="badge-nexora text-warning text-[10px] sm:text-xs whitespace-nowrap">+{ach.coinReward} Coins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
