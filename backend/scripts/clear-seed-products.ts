import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all products whose images array contains a local /images/ path (seeded mock data)
  const all = await prisma.product.findMany({ select: { id: true, name: true, images: true } });

  const seeded = all.filter((p) => {
    const imgs = p.images as string[];
    return imgs.length === 0 || imgs.some((img) => img.startsWith('/images/') || img === '');
  });

  console.log(`Found ${seeded.length} seeded products to delete:`);
  seeded.forEach((p) => console.log(`  - ${p.name}`));

  if (seeded.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  const ids = seeded.map((p) => p.id);
  const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
  console.log(`\nDeleted ${result.count} products.`);
}

main()
  .catch((e) => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
