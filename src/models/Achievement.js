import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['gameplay', 'progression', 'special'], default: 'gameplay' },
  xpReward: { type: Number, default: 0, min: 0 },
  coinReward: { type: Number, default: 0, min: 0 },
  condition: {
    type: { type: String, required: true },
    gameSlug: { type: String },
    threshold: { type: Number, required: true },
  },
}, { timestamps: true });

export default mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);
