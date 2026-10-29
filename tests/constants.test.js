import { levelFromXP, xpForNextLevel, XP } from '@/lib/constants';

describe('XP / level formula', () => {
  test('level 1 at 0 XP', () => {
    expect(levelFromXP(0).level).toBe(1);
  });

  test('level 2 at exactly xpForNextLevel(1)', () => {
    const need = xpForNextLevel(1);
    expect(levelFromXP(need).level).toBe(2);
    expect(levelFromXP(need - 1).level).toBe(1);
  });

  test('level 3 requires cumulative sum', () => {
    const need = xpForNextLevel(1) + xpForNextLevel(2);
    expect(levelFromXP(need).level).toBe(3);
    expect(levelFromXP(need - 1).level).toBe(2);
  });

  test('xpForNextLevel grows by GROWTH each level', () => {
    for (let l = 1; l < 10; l++) {
      const diff = xpForNextLevel(l + 1) - xpForNextLevel(l);
      expect(diff).toBe(XP.GROWTH_PER_LEVEL);
    }
  });

  test('negative XP treated as 0', () => {
    expect(levelFromXP(-100).level).toBe(1);
  });
});
