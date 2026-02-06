#!/usr/bin/env node
/**
 * Promote a user to developer role by email.
 * Called by ./scripts/promote-to-developer.sh (which prompts for email).
 *
 * Best for deployment/SSH: runs standalone, does not require the Next.js server.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables (same order as other scripts)
const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath });
    break;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const TARGET_ROLE = 'developer';

function printUsage() {
  console.log(`
Usage: ./scripts/promote-to-developer.sh
       (prompts for email)

Promotes the user with the given email to the developer role.
`);
}

function isValidEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

async function promoteToDeveloper(email) {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables.');
    console.error('   Ensure .env or .env.local contains MONGODB_URI.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const RoleSchema = new mongoose.Schema(
      { name: { type: String, required: true, unique: true }, description: { type: String, default: '' } },
      { versionKey: false }
    );
    const UserSchema = new mongoose.Schema(
      { name: String, email: String, username: String, password: String, role: String, roleRef: mongoose.Schema.Types.ObjectId },
      { timestamps: true, versionKey: false }
    );

    const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Ensure developer role exists
    let roleDoc = await Role.findOne({ name: TARGET_ROLE });
    if (!roleDoc) {
      roleDoc = await Role.create({ name: TARGET_ROLE, description: 'Technical role' });
      console.log(`📋 Created role: ${TARGET_ROLE}`);
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error(`❌ No user found with email: ${normalizedEmail}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const alreadyDeveloper = (user.role || '').toLowerCase() === TARGET_ROLE;
    const alreadyVerified = user.isEmailVerified === true;
    if (alreadyDeveloper && alreadyVerified) {
      console.log(`ℹ️  User ${normalizedEmail} already has role: ${TARGET_ROLE} and is verified`);
      await mongoose.disconnect();
      return;
    }

    await User.updateOne(
      { email: normalizedEmail },
      { $set: { role: roleDoc.name, roleRef: roleDoc._id, isEmailVerified: true } }
    );

    console.log(`✅ User ${normalizedEmail} promoted to ${TARGET_ROLE} and marked email as verified`);
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('✨ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

const emailArg = process.argv[2];
if (!emailArg) {
  printUsage();
  console.error('❌ Please provide an email.');
  process.exit(1);
}

if (!isValidEmail(emailArg)) {
  console.error(`❌ Invalid email format: ${emailArg}`);
  process.exit(1);
}

promoteToDeveloper(emailArg);
