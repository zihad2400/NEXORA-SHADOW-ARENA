export const GAME_SLUGS = Object.freeze({
  NEON_DODGE: 'neon-dodge',
  SHADOW_REFLEX: 'shadow-reflex',
  CYBER_MEMORY: 'cyber-memory',
});

export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

export const XP = Object.freeze({
  BASE_PER_LEVEL: 100,
  GROWTH_PER_LEVEL: 50,
});

export const REWARDS = Object.freeze({
  COINS_PER_MATCH: 5,
  XP_PER_MATCH_BASE: 10,
});

export const SESSION_LIMITS = Object.freeze({
  NEON_DODGE_MAX_DURATION_MS: 5 * 60 * 1000,
  REFLEX_MAX_DURATION_MS: 30 * 1000,
  MEMORY_EASY_MAX_MS: 5 * 60 * 1000,
  MEMORY_HARD_MAX_MS: 10 * 60 * 1000,
  SESSION_TTL_MS: 15 * 60 * 1000,
});

export function xpForNextLevel(currentLevel) {
  return XP.BASE_PER_LEVEL + (Math.max(1, currentLevel) - 1) * XP.GROWTH_PER_LEVEL;
}

export function levelFromXP(totalXP) {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXP));
  while (remaining >= xpForNextLevel(level) && level < 1000) {
    remaining -= xpForNextLevel(level);
    level++;
  }
  return {
    level,
    xpIntoLevel: remaining,
    xpForNext: xpForNextLevel(level),
  };
}

export const ERROR_CODES = Object.freeze({
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL',
});
