/**
 * Promote an existing user to admin by email.
 * Usage: node scripts/promote-admin.mjs user@example.com
 * Requires MONGODB_URI env (auto-loaded from .env.local by dotenv/config if installed;
 * otherwise pass inline: MONGODB_URI=... node scripts/promote-admin.mjs ...)
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local') });
import mongoose from 'mongoose';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: node scripts/promote-admin.mjs <email>');
  process.exit(1);
}
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const res = await mongoose.connection.collection('users').updateOne(
    { emailNormalized: email },
    { $set: { role: 'admin' } }
  );
  if (res.matchedCount === 0) {
    console.error('No user with that email.');
    process.exitCode = 1;
  } else {
    console.log(`Promoted ${email} to admin.`);
  }
  await mongoose.disconnect();
};
run().catch((e) => { console.error(e); process.exit(1); });
