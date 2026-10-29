import mongoose from 'mongoose';

const matchResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  score: { type: Number, required: true, min: 0 },
  durationMs: { type: Number, required: true, min: 0 },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  verification: { type: String, enum: ['validated', 'flagged'], default: 'validated', index: true },
  completedAt: { type: Date, required: true, default: Date.now, index: true },
}, { timestamps: true });

matchResultSchema.index({ game: 1, verification: 1, score: -1, completedAt: 1 });
matchResultSchema.index({ user: 1, completedAt: -1 });
export default mongoose.models.MatchResult || mongoose.model('MatchResult', matchResultSchema);
