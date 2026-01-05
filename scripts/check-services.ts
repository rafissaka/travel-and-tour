import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fetching all services...\n');

    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        slug: true,
        category: true,
        isActive: true,
        createdAt: true,
      }
    });

    console.log(`Total services: ${services.length}\n`);

    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title}`);
      console.log(`   Slug: ${service.slug}`);
      console.log(`   Category: ${service.category || 'N/A'}`);
      console.log(`   Active: ${service.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${service.createdAt}`);
      console.log('');
    });

    // Check active services
    const activeServices = services.filter(s => s.isActive);
    console.log(`Active services: ${activeServices.length}`);
    console.log(`Inactive services: ${services.length - activeServices.length}`);

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
