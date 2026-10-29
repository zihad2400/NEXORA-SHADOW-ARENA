import { destroySession } from '@/lib/auth';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(req) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);
  await destroySession();
  return jsonOk({ message: 'Logged out' });
}
