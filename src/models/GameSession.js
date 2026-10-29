import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  state: { type: String, enum: ['active', 'completed', 'expired'], default: 'active', index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  completedAt: { type: Date },
  seed: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  submissionState: { type: String, enum: ['pending', 'submitted'], default: 'pending' },
}, { timestamps: true });

gameSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
export default mongoose.models.GameSession || mongoose.model('GameSession', gameSessionSchema);
