import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.AUTH_SECRET,
  cookieName: 'nexora_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}

export async function destroySession() {
  const s = await getSession();
  s.destroy();
}

export async function setSessionUser(user) {
  const s = await getSession();
  s.user = {
    id: String(user._id),
    username: user.username,
    role: user.role,
  };
  await s.save();
  return s;
}
