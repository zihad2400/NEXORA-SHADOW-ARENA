import crypto from 'crypto';
import Game from '@/models/Game';
import GameSession from '@/models/GameSession';
import { SESSION_LIMITS } from '@/lib/constants';

export async function listPublishedGames({ q, category, difficulty, sort } = {}) {
  const filter = { published: true };
  if (category && category !== 'all') filter.category = category;
  if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
  if (q) {
    const safe = String(q).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
    ];
  }

  let sortSpec = { createdAt: -1 };
  if (sort === 'name') sortSpec = { name: 1 };
  else if (sort === 'difficulty') sortSpec = { difficulty: 1 };
  else if (sort === 'featured') sortSpec = { featured: -1, createdAt: -1 };

  return Game.find(filter).sort(sortSpec).limit(60).lean();
}

export async function getGameBySlug(slug, { requirePublished = true } = {}) {
  const filter = { slug: slug.toLowerCase() };
  if (requirePublished) filter.published = true;
  return Game.findOne(filter).lean();
}

const MAX_DURATION = {
  'neon-dodge': SESSION_LIMITS.NEON_DODGE_MAX_DURATION_MS,
  'shadow-reflex': SESSION_LIMITS.REFLEX_MAX_DURATION_MS,
  'cyber-memory': SESSION_LIMITS.MEMORY_HARD_MAX_MS,
};

export async function createSession({ userId, gameDoc }) {
  const sessionId = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_LIMITS.SESSION_TTL_MS);
  const seed = crypto.randomBytes(16).toString('hex');

  const doc = await GameSession.create({
    user: userId,
    game: gameDoc._id,
    sessionId,
    expiresAt,
    seed,
  });
  return doc;
}

export function getMaxDuration(gameSlug) {
  return MAX_DURATION[gameSlug] || SESSION_LIMITS.SESSION_TTL_MS;
}
