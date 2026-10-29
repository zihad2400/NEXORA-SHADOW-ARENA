import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ensureDailyChallengesForToday } from '@/services/challengeService';
import UserChallenge from '@/models/UserChallenge';
import ProgressBar from '@/components/ui/ProgressBar';
import ClaimButton from './ClaimButton';

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login?callbackUrl=/challenges');

  await connectDB();
  
  const challenges = await ensureDailyChallengesForToday();
  const progressList = await UserChallenge.find({ user: session.user.id }).lean();
  const progressMap = new Map(progressList.map(p => [String(p.challenge), p]));

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Daily Challenges</h1>
        <p className="text-text-secondary text-sm">Complete these objectives to earn bonus XP and Coins. Resets every day at 00:00 UTC.</p>
      </div>

      {challenges.length === 0 ? (
        <div className="surface p-8 text-center text-text-secondary">
          No challenges available today. Check back later!
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => {
            const prog = progressMap.get(String(c._id));
            const current = prog?.progress || 0;
            const isComplete = current >= c.target;
            const isClaimed = prog?.claimed || false;

            return (
              <div 
                key={c._id} 
                className={`surface p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center transition-all ${
                  isClaimed ? 'opacity-60 border-border' : isComplete ? 'border-success/40 bg-success/5' : ''
                }`}
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="font-display font-semibold text-base sm:text-lg">{c.title}</div>
                    {isClaimed && <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded shrink-0">CLAIMED</span>}
                  </div>
                  <p className="text-text-secondary text-sm mb-4">{c.description}</p>
                  
                  <div className="flex items-center gap-4 max-w-sm">
                    <ProgressBar value={Math.min(current, c.target)} max={c.target} className="flex-1" />
                    <div className="text-xs sm:text-sm font-mono text-text-secondary whitespace-nowrap shrink-0">
                      {Math.min(current, c.target)} / {c.target}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-nexora text-xs whitespace-nowrap">+{c.xpReward} XP</span>
                    <span className="badge-nexora text-warning text-xs whitespace-nowrap">+{c.coinReward} Coins</span>
                  </div>
                  
                  <ClaimButton 
                    challengeId={String(c._id)} 
                    isComplete={isComplete} 
                    isClaimed={isClaimed} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
