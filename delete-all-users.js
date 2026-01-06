import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load environment variables
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const filePath = resolve(process.cwd(), file);
  if (existsSync(filePath)) {
    dotenv.config({ path: filePath });
    break;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.error('   Please make sure your .env or .env.local file contains MONGODB_URI');
  process.exit(1);
}

// Extract database name from URI for display
const dbNameMatch = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';

async function deleteAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📦 Database: ${dbName}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model properly
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      roleRef: mongoose.Schema.Types.ObjectId,
      isEmailVerified: Boolean,
      otp: String,
      otpExpires: Date,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Count users before deletion
    const count = await User.countDocuments();
    console.log(`📊 Found ${count} user(s) in database`);

    if (count === 0) {
      console.log('ℹ️  No users to delete');
      await mongoose.disconnect();
      return;
    }

    // Ask for confirmation (in a script, we'll proceed but show warning)
    console.log(`⚠️  WARNING: About to delete ${count} user(s) from database "${dbName}"`);
    console.log('   Proceeding with deletion in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} user(s)`);

    // Verify deletion
    const remaining = await User.countDocuments();
    console.log(`📊 Remaining users: ${remaining}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

deleteAllUsers();

