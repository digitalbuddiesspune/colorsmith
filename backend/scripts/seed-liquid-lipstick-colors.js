import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Color from '../models/Color.js';

dotenv.config();

const LIQUID_LIPSTICK_COLORS = [
  { name: 'Brick Red', hexCode: '#9B4F3F' },
  { name: 'Nude Latte', hexCode: '#D4A59A' },
  { name: 'Berry Bliss', hexCode: '#8B3A62' },
  { name: 'Terracotta', hexCode: '#C36241' },
  { name: 'Mauve Magic', hexCode: '#915F6D' },
  { name: 'Classic Cherry', hexCode: '#E0115F' },
  { name: 'Dusty Rose', hexCode: '#DCAE96' },
  { name: 'Wine Stain', hexCode: '#722F37' },
  { name: 'Peachy Keen', hexCode: '#FFDAB9' },
  { name: 'Plum Perfection', hexCode: '#8E4585' },
];

async function seedLiquidLipstickColors() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const product = await Product.findOne({
    name: { $regex: /liquid lipstick/i },
  });
  if (!product) {
    console.log('No "Liquid Lipstick" product found. Create the product first in Admin → Products.');
    await mongoose.disconnect();
    process.exit(1);
  }

  let added = 0;
  for (const { name, hexCode } of LIQUID_LIPSTICK_COLORS) {
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

  console.log(`Liquid lipstick colors: ${added} added.`);
  await mongoose.disconnect();
  console.log('Done.');
}

seedLiquidLipstickColors().catch((e) => {
  console.error(e);
  process.exit(1);
});
