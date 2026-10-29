import mongoose from 'mongoose';
import { ROLES } from '@/lib/constants';

const settingsSchema = new mongoose.Schema(
  {
    soundEnabled: { type: Boolean, default: true },
    reducedMotion: { type: Boolean, default: false },
    profilePublic: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, trim: true,
      minlength: 3, maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },
    usernameLower: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    emailNormalized: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    // Updated to strictly allow any character/emoji up to 32 length
    avatar: { type: String, default: 'default', maxlength: 32 },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    coins: { type: Number, default: 0, min: 0 },
    settings: { type: settingsSchema, default: () => ({}) },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

userSchema.index({ xp: -1 });

// Force Mongoose to delete the cached model in development
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', userSchema);
