import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Color from '../models/Color.js';

dotenv.config();

const NAIL_LACQUER_COLORS = [
  { name: 'Velvet Rose', hexCode: '#C96480' },
  { name: 'Mocha Dream', hexCode: '#8B7355' },
  { name: 'Sage Green', hexCode: '#9CAF88' },
  { name: 'Lavender Haze', hexCode: '#B19CD9' },
  { name: 'Coral Crush', hexCode: '#FF7F50' },
  { name: 'Classic Red', hexCode: '#DC143C' },
  { name: 'Navy Nights', hexCode: '#1E3A5F' },
  { name: 'Golden Hour', hexCode: '#D4AF37' },
  { name: 'Blush Pink', hexCode: '#FFB6C1' },
  { name: 'Midnight Black', hexCode: '#000000' },
];

async function seedNailLacquerColors() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const product = await Product.findOne({
    name: { $regex: /nail lacquer/i },
  });
  if (!product) {
    console.log('No "Nail Lacquer" product found. Create the product first in Admin → Products.');
    await mongoose.disconnect();
    process.exit(1);
  }

  let added = 0;
  for (const { name, hexCode } of NAIL_LACQUER_COLORS) {
    const exists = await Color.findOne({ product: product._id, name });
    if (!exists) {
      const color = await Color.create({
        name,
        hexCode,
        product: product._id,
      });
      await Product.findByIdAndUpdate(product._id, { $push: { colors: color._id } });
      added++;
      console.log(`  Added: ${name} (${hexCode})`);
    }
  }

  console.log(`Nail lacquer colors: ${added} added.`);
  await mongoose.disconnect();
  console.log('Done.');
}

seedNailLacquerColors().catch((e) => {
  console.error(e);
  process.exit(1);
});
