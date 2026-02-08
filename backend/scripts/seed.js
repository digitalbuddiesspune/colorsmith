import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Grade from '../models/Grade.js';
import Color from '../models/Color.js';

dotenv.config();

const categories = [
  'Nail lacquers',
  'Liquid lipstick',
  'Lip gloss',
  'Nail remover',
  'Traditional sindoor',
  'Face primer',
  'Eyeliner',
  'Mascara',
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await Admin.findOne({ email: 'admin@colorsmith.com' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      name: 'Admin',
      email: 'admin@colorsmith.com',
      password: hashedPassword,
    });
    console.log('Admin created (admin@colorsmith.com / admin123)');
  }

  for (const name of categories) {
    await Category.findOneAndUpdate(
      { name },
      { name, description: `${name} category` },
      { upsert: true, new: true }
    );
  }
  console.log('Categories seeded');

  const catDocs = await Category.find();
  for (const cat of catDocs) {
    const existing = await Product.findOne({ category: cat._id, name: cat.name });
    if (!existing) {
      await Product.create({
        name: cat.name,
        category: cat._id,
        description: `Sample ${cat.name} product`,
      });
    }
  }
  console.log('Sample products seeded');

  await mongoose.disconnect();
  console.log('Seed done');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
