import { registerSchema, loginSchema } from '@/lib/validation';

describe('validation', () => {
  test('register: rejects short password', () => {
    const r = registerSchema.safeParse({
      username: 'alice', email: 'a@b.co', password: 'short', confirmPassword: 'short',
    });
    expect(r.success).toBe(false);
  });

  test('register: rejects mismatched password', () => {
    const r = registerSchema.safeParse({
      username: 'alice', email: 'a@b.co', password: 'password123', confirmPassword: 'password456',
    });
    expect(r.success).toBe(false);
    expect(r.error.issues[0].path).toContain('confirmPassword');
  });

  test('register: rejects invalid username chars', () => {
    const r = registerSchema.safeParse({
      username: 'bad user!', email: 'a@b.co', password: 'password123', confirmPassword: 'password123',
    });
    expect(r.success).toBe(false);
  });

  test('register: normalizes email to lowercase', () => {
    const r = registerSchema.safeParse({
      username: 'alice', email: 'Alice@Example.COM', password: 'password123', confirmPassword: 'password123',
    });
    expect(r.success).toBe(true);
    expect(r.data.email).toBe('alice@example.com');
  });

  test('login: rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'a@b.co', password: '' });
    expect(r.success).toBe(false);
  });
});
