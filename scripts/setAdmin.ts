import mongoose from 'mongoose';
import { Member } from '../models/Member';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const email = 'REPLACE_WITH_ADMIN_EMAIL'; // <-- Set the email here

async function setAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Member.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );
  if (result) {
    console.log(`Success: ${result.email} is now an admin.`);
  } else {
    console.log('No user found with that email.');
  }
  await mongoose.disconnect();
}

setAdmin();
