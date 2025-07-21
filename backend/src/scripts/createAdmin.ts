import mongoose from 'mongoose';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);

  const email = await ask('Admin email: ');
  const name = await ask('Admin name: ');
  const password = await ask('Admin password: ');

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User with this email already exists.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = new User({
    email,
    name,
    password: hash,
    role: 'admin',
    isVerified: true,
  });
  await admin.save();
  console.log('Admin user created successfully!');
  process.exit(0);
}

main(); 