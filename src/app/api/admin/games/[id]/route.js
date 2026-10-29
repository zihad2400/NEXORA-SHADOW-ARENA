import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';
import Game from '@/models/Game';

export async function PATCH(req, { params }) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);
  const session = await getSession();
  if (session?.user?.role !== 'admin') return jsonError('FORBIDDEN', 'Admin access required', 403);

  try {
    await connectDB();
    const game = await Game.findById(params.id);
    if (!game) return jsonError('NOT_FOUND', 'Game not found', 404);

    const body = await req.json();
    if (typeof body.published === 'boolean') game.published = body.published;
    
    await game.save();
    return jsonOk({ message: 'Game updated', game });
  } catch (err) {
    return jsonError('INTERNAL', 'Failed to update game', 500);
  }
}
