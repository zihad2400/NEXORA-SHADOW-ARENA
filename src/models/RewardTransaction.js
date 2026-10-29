import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['match', 'achievement', 'challenge'], required: true },
  xpDelta: { type: Number, default: 0 },
  coinDelta: { type: Number, default: 0 },
  reason: { type: String, required: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

export default mongoose.models.RewardTransaction || mongoose.model('RewardTransaction', rewardTransactionSchema);
