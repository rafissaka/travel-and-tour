import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if Application model exists
    const count = await prisma.application.count();
    console.log('✅ Application table exists!');
    console.log(`Number of applications: ${count}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
