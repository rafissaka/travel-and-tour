import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Migrating "Stipendium Hungaricum" from Service to Program...\n');

    // Find the service "Stipendium Hungaricum Scholarship Programme"
    const stipendiumService = await prisma.service.findFirst({
      where: { slug: 'stipendium-hungaricum-scholarship-programme' }
    });

    if (!stipendiumService) {
      console.log('❌ Service not found');
      return;
    }

    // Find the parent service "Study & Summer Programs Abroad"
    const studyProgramsService = await prisma.service.findFirst({
      where: { slug: 'study-programs' }
    });

    if (!studyProgramsService) {
      console.log('❌ Parent service "Study & Summer Programs Abroad" not found');
      return;
    }

    console.log(`Found service: ${stipendiumService.title}`);
    console.log(`Parent service: ${studyProgramsService.title}\n`);

    // Create as a Program under Study Programs
    const program = await prisma.program.create({
      data: {
        serviceId: studyProgramsService.id,
        title: stipendiumService.title,
        slug: stipendiumService.slug,
        tagline: stipendiumService.tagline,
        description: stipendiumService.description,
        fullDescription: stipendiumService.fullDescription,
        imageUrl: stipendiumService.imageUrl,
        features: stipendiumService.features || undefined,
        country: 'Hungary',
        isActive: stipendiumService.isActive,
        displayOrder: stipendiumService.displayOrder,
        createdById: stipendiumService.createdById,
      }
    });

    console.log(`✅ Created program: ${program.title}`);
    console.log(`   ID: ${program.id}`);
    console.log(`   Slug: ${program.slug}\n`);

    // Delete the old service
    await prisma.service.delete({
      where: { id: stipendiumService.id }
    });

    console.log(`✅ Deleted old service\n`);
    console.log('Migration completed successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
