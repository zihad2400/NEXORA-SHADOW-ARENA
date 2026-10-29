import { connectDB } from '@/lib/mongodb';
import { registerSchema, parseOrError } from '@/lib/validation';
import { createUser } from '@/services/userService';
import { setSessionUser } from '@/lib/auth';
import { jsonOk, jsonError, rateLimit, clientKey, checkOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const rl = rateLimit({ key: clientKey(req, 'register'), max: 5, windowMs: 60_000 });
  if (!rl.allowed) return jsonError('RATE_LIMITED', 'Too many attempts. Try again shortly.', 429);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON body', 400); }

  const parsed = parseOrError(registerSchema, body);
  if (!parsed.success) return jsonError('VALIDATION', parsed.error.message, 400, { field: parsed.error.field });

  try {
    await connectDB();
    const user = await createUser(parsed.data);
    await setSessionUser(user);
    return jsonOk({ user: { id: String(user._id), username: user.username, role: user.role } }, 201);
  } catch (err) {
    if (err.code === 'CONFLICT') return jsonError('CONFLICT', err.message, 409);
    console.error('[register]', err);
    return jsonError('INTERNAL', 'Registration failed', 500);
  }
}
