import { connectDB } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { jsonOk, jsonError, checkOrigin } from '@/lib/security';
import User from '@/models/User';

export async function PATCH(req, { params }) {
  if (!checkOrigin(req)) return jsonError('FORBIDDEN', 'Invalid origin', 403);
  
  const session = await getSession();
  if (session?.user?.role !== 'admin') return jsonError('FORBIDDEN', 'Admin access required', 403);

  // Prevent admin from modifying their own account (safety)
  if (params.id === session.user.id) {
    return jsonError('VALIDATION', 'You cannot modify your own admin account here.', 400);
  }

  try {
    await connectDB();
    const targetUser = await User.findById(params.id);
    if (!targetUser) return jsonError('NOT_FOUND', 'User not found', 404);

    // Strict Protection: Never allow changing status or role of another Admin
    if (targetUser.role === 'admin') {
      return jsonError('FORBIDDEN', 'Cannot modify another Admin account.', 403);
    }

    const body = await req.json();
    if (body.role === 'admin' || body.role === 'user') targetUser.role = body.role;
    if (body.status === 'active' || body.status === 'suspended') targetUser.status = body.status;
    
    await targetUser.save();
    
    return jsonOk({ 
      message: 'User updated successfully', 
      user: { id: targetUser._id, role: targetUser.role, status: targetUser.status } 
    });
  } catch (err) {
    console.error('[admin/users PATCH]', err);
    return jsonError('INTERNAL', 'Failed to update user', 500);
  }
}
