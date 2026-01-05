import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  { slug: 'family-travel', priceRange: '₵600 - ₵2,000' },
  { slug: 'study-programs', priceRange: '₵8,000 - ₵40,000' },
  { slug: 'tours', priceRange: '₵1,200 - ₵20,000' },
  { slug: 'reservations', priceRange: 'Variable' },
  { slug: 'visa-assistance', priceRange: '₵400 - ₵3,200' },
  { slug: 'itinerary', priceRange: '₵200 - ₵1,200' }
];

async function main() {
  console.log('Updating service prices to Ghana Cedis...');

  for (const update of updates) {
    const result = await prisma.service.updateMany({
      where: { slug: update.slug },
      data: { priceRange: update.priceRange }
    });

    if (result.count > 0) {
      console.log(`Updated ${update.slug} to ${update.priceRange}`);
    }
  }

  console.log('All prices updated to Ghana Cedis!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
