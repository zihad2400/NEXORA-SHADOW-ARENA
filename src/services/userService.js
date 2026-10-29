import bcrypt from 'bcryptjs';
import User from '@/models/User';
import PlayerStats from '@/models/PlayerStats';
import { levelFromXP } from '@/lib/constants';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function createUser({ username, email, password }) {
  const passwordHash = await hashPassword(password);
  const emailNormalized = email.trim().toLowerCase();
  const usernameLower = username.trim().toLowerCase();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role = adminEmail && emailNormalized === adminEmail ? 'admin' : 'user';

  let user;
  try {
    user = await User.create({
      username,
      usernameLower,
      email: email.trim(),
      emailNormalized,
      passwordHash,
      role,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      const e = new Error(
        field.includes('email') ? 'Email already registered' : 'Username taken'
      );
      e.code = 'CONFLICT';
      throw e;
    }
    throw err;
  }

  await PlayerStats.create({ user: user._id });
  return user;
}

export async function findUserByEmail(email) {
  return User.findOne({ emailNormalized: email.trim().toLowerCase() });
}

export async function findUserWithPassword(email) {
  return User.findOne({ emailNormalized: email.trim().toLowerCase() }).select('+passwordHash');
}

export async function findUserById(id) {
  return User.findById(id);
}

export function applyLevel(userDoc) {
  const { level } = levelFromXP(userDoc.xp);
  userDoc.level = level;
  return userDoc;
}
