import MatchResult from '@/models/MatchResult';
import Game from '@/models/Game';

export async function getGameLeaderboard({ gameSlug, page = 1, pageSize = 25, sinceDate }) {
  const game = await Game.findOne({ slug: gameSlug }).lean();
  if (!game) return { items: [], total: 0, page, pageSize };

  const match = { game: game._id, verification: 'validated' };
  if (sinceDate) match.completedAt = { $gte: sinceDate };

  const pipeline = [
    { $match: match },
    { $sort: { score: -1, completedAt: 1 } },
    {
      $group: {
        _id: '$user',
        bestScore: { $first: '$score' },
        achievedAt: { $first: '$completedAt' },
      },
    },
    { $sort: { bestScore: -1, achievedAt: 1 } },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDoc' } },
          { $unwind: '$userDoc' },
          {
            $project: {
              _id: 0,
              userId: '$_id',
              username: '$userDoc.username',
              avatar: '$userDoc.avatar',
              level: '$userDoc.level',
              score: '$bestScore',
              achievedAt: '$achievedAt',
            },
          },
        ],
        totalAgg: [{ $count: 'count' }],
      },
    },
  ];

  const agg = await MatchResult.aggregate(pipeline);
  const items = agg[0]?.items || [];
  const total = agg[0]?.totalAgg?.[0]?.count || 0;

  return {
    items: items.map((it, idx) => ({ ...it, rank: (page - 1) * pageSize + idx + 1 })),
    total,
    page,
    pageSize,
    game: { name: game.name, slug: game.slug },
  };
}

export async function getUserRankForGame({ userId, gameSlug }) {
  const game = await Game.findOne({ slug: gameSlug }).lean();
  if (!game) return null;

  const agg = await MatchResult.aggregate([
    { $match: { game: game._id, verification: 'validated' } },
    { $sort: { score: -1, completedAt: 1 } },
    {
      $group: {
        _id: '$user',
        bestScore: { $first: '$score' },
        achievedAt: { $first: '$completedAt' },
      },
    },
    { $sort: { bestScore: -1, achievedAt: 1 } },
    {
      $group: {
        _id: null,
        users: { $push: { userId: '$_id', score: '$bestScore' } },
      },
    },
  ]);

  const list = agg[0]?.users || [];
  const idx = list.findIndex((u) => String(u.userId) === String(userId));
  if (idx === -1) return null;
  return { rank: idx + 1, score: list[idx].score, total: list.length };
}
