import { rateLimit, checkOrigin, publicUser } from '@/lib/security';

describe('rateLimit', () => {
  test('allows up to max, then blocks', () => {
    const key = 'test:rl:' + Math.random();
    for (let i = 0; i < 3; i++) {
      expect(rateLimit({ key, max: 3, windowMs: 10000 }).allowed).toBe(true);
    }
    expect(rateLimit({ key, max: 3, windowMs: 10000 }).allowed).toBe(false);
  });
});

describe('checkOrigin', () => {
  function mkReq(method, headers = {}) {
    return { method, headers: { get: (h) => headers[h.toLowerCase()] } };
  }
  test('GET always allowed', () => {
    expect(checkOrigin(mkReq('GET'))).toBe(true);
  });
  test('POST without origin allowed in dev', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    expect(checkOrigin(mkReq('POST'))).toBe(true);
    process.env.NODE_ENV = prev;
  });
});

describe('publicUser', () => {
  test('strips passwordHash and internal fields', () => {
    const fake = {
      _id: 'abc', username: 'alice', email: 'a@b.co', passwordHash: 'SECRET',
      role: 'user', level: 2, xp: 100, coins: 5, avatar: 'default',
      settings: {}, createdAt: new Date(),
    };
    const pub = publicUser(fake);
    expect(pub.passwordHash).toBeUndefined();
    expect(pub.email).toBe('a@b.co');
    expect(pub.username).toBe('alice');
  });
});
