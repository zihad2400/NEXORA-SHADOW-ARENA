import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  dateKey: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['play_matches', 'score_in_game', 'play_game'] },
  gameSlug: { type: String },
  target: { type: Number, required: true, min: 1 },
  xpReward: { type: Number, default: 20, min: 0 },
  coinReward: { type: Number, default: 10, min: 0 },
}, { timestamps: true });

export default mongoose.models.DailyChallenge || mongoose.model('DailyChallenge', dailyChallengeSchema);
