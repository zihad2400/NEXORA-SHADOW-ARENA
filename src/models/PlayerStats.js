import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  totalValidatedScore: { type: Number, default: 0, min: 0 },
  matchesPlayed: { type: Number, default: 0, min: 0 },
  gamesCompleted: { type: [String], default: [] },
  bestByGame: { type: Map, of: Number, default: () => new Map() },
}, { timestamps: true });

export default mongoose.models.PlayerStats || mongoose.model('PlayerStats', playerStatsSchema);
