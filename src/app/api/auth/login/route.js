import { connectDB } from '@/lib/mongodb';
import { loginSchema, parseOrError } from '@/lib/validation';
import { findUserWithPassword, verifyPassword } from '@/services/userService';
import { setSessionUser } from '@/lib/auth';
import { jsonOk, jsonError, rateLimit, clientKey, checkOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const max = Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5;
  const windowMs = Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 60_000;
  const rl = rateLimit({ key: clientKey(req, 'login'), max, windowMs });
  if (!rl.allowed) return jsonError('RATE_LIMITED', 'Too many attempts. Try again shortly.', 429);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON body', 400); }

  const parsed = parseOrError(loginSchema, body);
  if (!parsed.success) return jsonError('VALIDATION', parsed.error.message, 400);

  try {
    await connectDB();
    const user = await findUserWithPassword(parsed.data.email);
    if (!user) return jsonError('UNAUTHORIZED', 'Invalid email or password', 401);
    if (user.status !== 'active') return jsonError('FORBIDDEN', 'Account suspended', 403);

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return jsonError('UNAUTHORIZED', 'Invalid email or password', 401);

    await setSessionUser(user);
    return jsonOk({ user: { id: String(user._id), username: user.username, role: user.role } });
  } catch (err) {
    console.error('[login]', err);
    return jsonError('INTERNAL', 'Login failed', 500);
  }
}
