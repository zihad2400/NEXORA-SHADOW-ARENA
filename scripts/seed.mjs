import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

const GAMES = [
  { slug: 'neon-dodge', name: 'Neon Dodge', category: 'arcade', difficulty: 'medium', description: 'Survive an endless arena of accelerating obstacles.', thumbnail: '/images/game-neon-dodge.svg', published: true, featured: true, instructions: 'Use arrow keys or WASD to move.', controls: 'Arrow keys / WASD / touch drag' },
  { slug: 'shadow-reflex', name: 'Shadow Reflex', category: 'reflex', difficulty: 'easy', description: 'Test your reaction time. Wait for the signal, tap, repeat.', thumbnail: '/images/game-shadow-reflex.svg', published: true, featured: true, instructions: 'Click as soon as the circle flashes.', controls: 'Click anywhere / Space / tap' },
  { slug: 'cyber-memory', name: 'Cyber Memory', category: 'puzzle', difficulty: 'medium', description: 'A matching game. Lower moves and faster time means a higher score.', thumbnail: '/images/game-cyber-memory.svg', published: true, featured: true, instructions: 'Flip two cards. Match pairs.', controls: 'Click / tap' },
  { slug: 'neon-snake', name: 'Neon Snake', category: 'arcade', difficulty: 'easy', description: 'Classic snake game with a glowing neon twist.', thumbnail: '/images/game-neon-snake.svg', published: true, featured: false, instructions: 'Use arrow keys to change direction. Eat the glowing orbs to grow.', controls: 'Arrow keys / WASD' },
  { slug: 'block-breaker', name: 'Block Breaker', category: 'arcade', difficulty: 'medium', description: 'Smash through layers of digital blocks using a reflective paddle.', thumbnail: '/images/game-block-breaker.svg', published: true, featured: false, instructions: 'Move the paddle with your mouse.', controls: 'Mouse / Touch' },
  { slug: 'cyber-2048', name: 'Cyber 2048', category: 'puzzle', difficulty: 'medium', description: 'Slide digital tiles to merge them and reach 2048.', thumbnail: '/images/game-cyber-2048.svg', published: true, featured: false, instructions: 'Use arrow keys to slide tiles.', controls: 'Arrow keys / WASD' },
  { slug: 'asteroid-hunter', name: 'Asteroid Hunter', category: 'arcade', difficulty: 'hard', description: 'Defend your sector from falling space rocks.', thumbnail: '/images/game-asteroid-hunter.svg', published: true, featured: false, instructions: 'Move left/right and press Space to fire.', controls: 'Left / Right arrows · Space to fire' },
  { slug: 'reaction-grid', name: 'Reaction Grid', category: 'reflex', difficulty: 'medium', description: 'Click the appearing targets before they vanish.', thumbnail: '/images/game-reaction-grid.svg', published: true, featured: false, instructions: 'Click or tap the glowing squares as fast as possible.', controls: 'Mouse / Touch' },
  { slug: 'memory-flip', name: 'Memory Flip', category: 'puzzle', difficulty: 'easy', description: 'A simpler, faster memory game. Perfect for quick brain training.', thumbnail: '/images/game-memory-flip.svg', published: true, featured: false, instructions: 'Flip cards to find matching pairs.', controls: 'Click / Tap' },
  { slug: 'cyber-runner', name: 'Cyber Runner', category: 'arcade', difficulty: 'hard', description: 'An endless runner through a cyberpunk city.', thumbnail: '/images/game-cyber-runner.svg', published: true, featured: false, instructions: 'Press Space or tap to jump. Avoid the blocks.', controls: 'Space / Tap' },
  { slug: 'color-match', name: 'Color Match', category: 'reflex', difficulty: 'easy', description: 'Does the word match the color? Test your brain and reflexes.', thumbnail: '/images/game-color-match.svg', published: true, featured: false, instructions: 'Read the word and click if it matches the color.', controls: 'Mouse / Touch' },
  { slug: 'tower-stack', name: 'Tower Stack', category: 'arcade', difficulty: 'medium', description: 'Stack blocks as high as you can.', thumbnail: '/images/game-tower-stack.svg', published: true, featured: false, instructions: 'Tap or click to drop the moving block.', controls: 'Mouse / Touch / Space' },
  { slug: 'reflex-dash', name: 'Reflex Dash', category: 'reflex', difficulty: 'medium', description: 'A high-speed dodging game. Move left or right to survive.', thumbnail: '/images/game-reflex-dash.svg', published: true, featured: false, instructions: 'Dodge the incoming red lasers.', controls: 'Left / Right arrows / Touch' }
];

const ACHIEVEMENTS = [
  { key: 'first_match', name: 'First Blood', description: 'Complete your first match.', category: 'gameplay', xpReward: 10, coinReward: 5, condition: { type: 'matches_played', threshold: 1 } },
  { key: 'ten_matches', name: 'Regular', description: 'Play 10 matches.', category: 'gameplay', xpReward: 25, coinReward: 15, condition: { type: 'matches_played', threshold: 10 } },
  { key: 'score_100_total', name: 'Beginner', description: 'Reach 100 total validated score.', category: 'progression', xpReward: 20, coinReward: 10, condition: { type: 'total_score', threshold: 100 } },
  { key: 'score_1000_total', name: 'Veteran', description: 'Reach 1,000 total validated score.', category: 'progression', xpReward: 50, coinReward: 25, condition: { type: 'total_score', threshold: 1000 } },
  { key: 'neon_200', name: 'Survivor', description: 'Score 200+ in Neon Dodge.', category: 'gameplay', xpReward: 30, coinReward: 15, condition: { type: 'game_best_score', gameSlug: 'neon-dodge', threshold: 200 } },
  { key: 'level_5', name: 'Rising', description: 'Reach level 5.', category: 'progression', xpReward: 40, coinReward: 20, condition: { type: 'level_reached', threshold: 5 } },
];

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB');

  const games = mongoose.connection.collection('games');
  for (const g of GAMES) {
    // We use $set here because we want to UPDATE existing thumbnails to the new ones
    const r = await games.updateOne({ slug: g.slug }, { $set: g }, { upsert: true });
    console.log(`game ${g.slug}: ${r.upsertedCount ? 'inserted' : 'updated'}`);
  }

  const achievements = mongoose.connection.collection('achievements');
  for (const a of ACHIEVEMENTS) {
    const r = await achievements.updateOne({ key: a.key }, { $setOnInsert: a }, { upsert: true });
    console.log(`achievement ${a.key}: ${r.upsertedCount ? 'inserted' : 'exists'}`);
  }

  await mongoose.disconnect();
  console.log('Seed complete!');
}

main().catch((e) => { console.error(e); process.exit(1); });
