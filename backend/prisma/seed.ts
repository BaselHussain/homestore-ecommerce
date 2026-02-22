import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Image paths reference the homestore-sparkle/src/assets directory.
// In production, replace with hosted URLs (CDN, S3, etc.).
const ASSET_BASE = '/assets';

const products = [
  {
    name: '9 Pcs Pots & Pans Set',
    description: 'A complete 9-piece pots and pans set for everyday cooking. Non-stick coating, dishwasher safe.',
    price: 65.0,
    stock: 50,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-pots-set.jpg`],
  },
  {
    name: '24 Pcs Cutlery Set',
    description: '24-piece stainless steel cutlery set. Includes forks, knives, spoons, and teaspoons for 6 people.',
    price: 22.95,
    stock: 75,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-cutlery.jpg`],
  },
  {
    name: 'Rattan Laundry Basket + Cover',
    description: 'Natural rattan laundry basket with removable cover. Eco-friendly and stylish for any bathroom or bedroom.',
    price: 19.5,
    stock: 40,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-laundry-basket.jpg`],
  },
  {
    name: 'Stand Patio Heater',
    description: 'Outdoor standing patio heater for year-round entertaining. Adjustable heat settings, safety tilt switch.',
    price: 530.0,
    stock: 15,
    category: 'Outdoor Furniture',
    images: [`${ASSET_BASE}/product-patio-heater.jpg`],
  },
  {
    name: 'Child Armchair',
    description: 'Comfortable child-sized armchair in soft fabric. Perfect for reading corners and play rooms.',
    price: 4.25,
    stock: 100,
    category: 'Toys',
    images: [`${ASSET_BASE}/product-child-chair.jpg`],
  },
  {
    name: 'Bamboo Napkin Holder',
    description: 'Sustainable bamboo napkin holder for dining tables. Holds up to 30 napkins, easy to clean.',
    price: 18.0,
    stock: 60,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-napkin-holder.jpg`],
  },
  {
    name: '5 Step Aluminium Ladder',
    description: 'Lightweight 5-step aluminium folding ladder. Anti-slip steps, 150kg load capacity.',
    price: 55.0,
    stock: 30,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-ladder.jpg`],
  },
  {
    name: 'Tool Box Classic Line 16"',
    description: '16-inch classic tool box with removable tray. Heavy-duty latch, comfortable carry handle.',
    price: 9.5,
    stock: 0,
    category: 'Household Goods',
    images: [`${ASSET_BASE}/product-toolbox.jpg`],
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing products
  await prisma.product.deleteMany();
  console.log('Cleared existing products');

  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    console.log(`  Created: ${created.name} (id: ${created.id})`);
  }

  console.log(`\nSeeded ${products.length} products successfully.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
