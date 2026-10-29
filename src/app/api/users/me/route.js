import { connectDB } from '@/lib/mongodb';
import { getSession, destroySession } from '@/lib/auth';
import { publicUser, jsonOk, jsonError, checkOrigin } from '@/lib/security';
import { findUserById } from '@/services/userService';
import { profileUpdateSchema, parseOrError } from '@/lib/validation';
import User from '@/models/User';
import PlayerStats from '@/models/PlayerStats';
import MatchResult from '@/models/MatchResult';
import UserAchievement from '@/models/UserAchievement';
import UserChallenge from '@/models/UserChallenge';
import RewardTransaction from '@/models/RewardTransaction';
import GameSession from '@/models/GameSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Not signed in', 401);

  try {
    await connectDB();
    const user = await findUserById(session.user.id);
    if (!user) return jsonError('NOT_FOUND', 'User not found', 404);
    return jsonOk({ user: publicUser(user) });
  } catch (err) {
    console.error('[users/me GET]', err);
    return jsonError('INTERNAL', 'Failed to load user', 500);
  }
}

export async function PATCH(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Not signed in', 401);

  let body;
  try { body = await req.json(); }
  catch { return jsonError('VALIDATION', 'Invalid JSON', 400); }

  const parsed = parseOrError(profileUpdateSchema, body);
  if (!parsed.success) return jsonError('VALIDATION', parsed.error.message, 400);

  try {
    await connectDB();
    
    const updates = {};
    if (parsed.data.username) {
      updates.username = parsed.data.username;
      updates.usernameLower = parsed.data.username.toLowerCase();
    }
    if (parsed.data.avatar) {
      updates.avatar = parsed.data.avatar;
    }
    if (parsed.data.settings) {
      updates.settings = parsed.data.settings;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) return jsonError('NOT_FOUND', 'User not found', 404);
    return jsonOk({ user: publicUser(updatedUser) });
    
  } catch (err) {
    if (err.code === 11000) return jsonError('CONFLICT', 'Username already taken', 409);
    
    // Log the exact Mongoose validation error
    console.error('[users/me PATCH]', err.message);
    
    // Return the exact error to the frontend for debugging
    return jsonError('INTERNAL', err.message || 'Failed to update profile', 500);
  }
}

export async function DELETE(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);

  const session = await getSession();
  if (!session?.user?.id) return jsonError('UNAUTHORIZED', 'Not signed in', 401);

  try {
    await connectDB();
    const userId = session.user.id;

    await Promise.all([
      User.findByIdAndDelete(userId),
      PlayerStats.findOneAndDelete({ user: userId }),
      MatchResult.deleteMany({ user: userId }),
      UserAchievement.deleteMany({ user: userId }),
      UserChallenge.deleteMany({ user: userId }),
      RewardTransaction.deleteMany({ user: userId }),
      GameSession.deleteMany({ user: userId }),
    ]);

    await destroySession();
    return jsonOk({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('[users/me DELETE]', err);
    return jsonError('INTERNAL', 'Failed to delete account', 500);
  }
}
