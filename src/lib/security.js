import { NextResponse } from 'next/server';
import { ERROR_CODES } from './constants';

export function jsonError(code, message, status = 400, extra = {}) {
  return NextResponse.json(
    { ok: false, error: { code, message }, ...extra },
    { status }
  );
}

export function jsonOk(data, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

const buckets = new Map();

export function rateLimit({ key, max, windowMs }) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    b = { start: now, count: 0 };
    buckets.set(key, b);
  }
  b.count++;
  if (b.count > max) {
    return { allowed: false, retryAfterMs: windowMs - (now - b.start) };
  }
  return { allowed: true, remaining: max - b.count };
}

export function clientKey(req, prefix) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${prefix}:${ip}`;
}

export function checkOrigin(req) {
  const method = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;
  const origin = req.headers.get('origin');
  const appUrl = process.env.APP_URL;
  if (!origin) {
    return process.env.NODE_ENV !== 'production';
  }
  if (appUrl && origin === appUrl) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
}

export function publicUser(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    id: String(u._id),
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    level: u.level,
    xp: u.xp,
    coins: u.coins,
    settings: u.settings,
    createdAt: u.createdAt,
  };
}

export function requireAdmin(session) {
  return session?.user?.role === 'admin';
}
export function requireUser(session) {
  return !!session?.user?.id;
}

export { ERROR_CODES };
