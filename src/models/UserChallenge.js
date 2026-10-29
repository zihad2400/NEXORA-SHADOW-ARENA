import mongoose from 'mongoose';

const userChallengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge', required: true, index: true },
  dateKey: { type: String, required: true, index: true },
  progress: { type: Number, default: 0, min: 0 },
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  claimedAt: { type: Date },
}, { timestamps: true });

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });
export default mongoose.models.UserChallenge || mongoose.model('UserChallenge', userChallengeSchema);
