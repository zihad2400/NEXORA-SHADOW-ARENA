import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, required: true, enum: ['arcade', 'reflex', 'puzzle'] },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    thumbnail: { type: String, default: '/images/game-default.svg' },
    published: { type: Boolean, default: false, index: true },
    instructions: { type: String, default: '' },
    controls: { type: String, default: '' },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

gameSchema.index({ published: 1, category: 1 });

export default mongoose.models.Game || mongoose.model('Game', gameSchema);
