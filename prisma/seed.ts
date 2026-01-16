import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create a default Super Admin user (if not exists) to be the creator of content
    const adminEmail = 'admin@godfirst.com';
    let admin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!admin) {
        const passwordHash = await hash('Admin123!', 12);
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                firstName: 'System',
                lastName: 'Admin',
                role: 'SUPER_ADMIN',
                isActive: true,
                emailVerified: true,
            },
        });
        console.log(`Created admin user: ${admin.email}`);
    } else {
        console.log(`Using existing admin user: ${admin.email}`);
    }

    // 2. Seed Events
    const events = [
        {
            title: 'Accra - Cape Coast Tour',
            slug: 'cape-coast',
            description: 'Start and End in Accra. Journey through Ghana\'s rich colonial history with guided tours of Cape Coast Castle and Elmina Castle, both UNESCO World Heritage Sites. Experience the Kakum National Park canopy walk, visit traditional fishing villages, and explore the vibrant coastal culture. Includes transportation, accommodation, meals, and expert local guides.',
            imageUrl: 'https://picsum.photos/seed/cape-coast/800/800',
            location: 'Accra to Cape Coast, Ghana',
            startDate: new Date('2025-12-15'),
            duration: '3 Days',
            status: 'UPCOMING',
            category: 'tour',
            isFeatured: true,
        },
        {
            title: 'Golden Heritage Tour',
            slug: 'golden-heritage',
            description: 'Experience Incredible Golden Royal Culture of Ghana. Visit the Manhyia Palace, explore the sacred Ashanti royal mausoleum, witness traditional Kente weaving, and attend a durbar with local chiefs. Tour includes visits to Kumasi Central Market, the National Cultural Centre, and traditional craft villages. Full board accommodation and cultural performances included.',
            imageUrl: 'https://picsum.photos/seed/golden-heritage/800/800',
            location: 'Kumasi, Ghana',
            startDate: new Date('2024-09-10'),
            duration: '5 Days',
            status: 'ENDED',
            category: 'tour',
        },
        {
            title: 'School Admission Open',
            slug: 'admissions',
            description: 'Applications now open for international student programs. Join world-class universities in Accra and Kumasi offering degrees in Engineering, Medicine, Business, Arts, and Sciences. Scholarship opportunities available for qualified students. Application includes visa support, accommodation assistance, and pre-arrival orientation. Early bird discount for applications before March 2026.',
            imageUrl: 'https://picsum.photos/seed/school-admission/800/800',
            location: 'Accra & Kumasi Universities',
            startDate: new Date('2026-01-01'),
            duration: 'Ongoing',
            status: 'UPCOMING',
            category: 'admission',
            isFeatured: true,
        },
        {
            title: 'Kakum National Park',
            slug: 'kakum',
            description: 'Walk the famous canopy walkway suspended 40 meters above the forest floor. Experience over 350 species of butterflies, 250 bird species, and observe forest elephants in their natural habitat. Includes guided nature walks, bird watching sessions, and overnight camping under the stars. Professional guides provide insights into the rainforest ecosystem and conservation efforts.',
            imageUrl: 'https://picsum.photos/seed/kakum-park/800/800',
            location: 'Kakum National Park, Ghana',
            startDate: new Date('2025-11-20'),
            duration: '2 Days',
            status: 'UPCOMING',
            category: 'tour',
        },
        {
            title: 'Mole Safari & Waterfalls',
            slug: 'mole-safari',
            description: 'Explore Ghana\'s largest wildlife reserve with elephants, antelopes, warthogs, and over 300 bird species. Morning and evening safari walks with experienced rangers. Visit the breathtaking Wli Waterfalls, Ghana\'s highest waterfall cascading from 80 meters. Includes accommodation at Mole Motel, all meals, guided safaris, and cultural village visits. Photography opportunities guaranteed.',
            imageUrl: 'https://picsum.photos/seed/mole-safari/800/800',
            location: 'Northern & Volta Region, Ghana',
            startDate: new Date('2026-02-05'),
            duration: '4 Days',
            status: 'UPCOMING',
            category: 'tour',
        },
        {
            title: 'Study Abroad Workshop',
            slug: 'study-abroad',
            description: 'Comprehensive workshop for students planning to study abroad. Learn about scholarship applications, visa processes, TOEFL/IELTS preparation, university selection, and financial planning. Guest speakers from international universities, successful alumni testimonials, one-on-one counseling sessions, and application review services. Receive workshop materials, university brochures, and follow-up support.',
            imageUrl: 'https://picsum.photos/seed/study-abroad/800/800',
            location: 'Accra Conference Center',
            startDate: new Date('2024-08-15'),
            duration: '1 Day',
            status: 'ENDED',
            category: 'education',
        },
    ];

    for (const event of events) {
        const existing = await prisma.event.findUnique({ where: { slug: event.slug } });
        if (!existing) {
            await prisma.event.create({
                data: {
                    ...event,
                    createdById: admin.id,
                    // Convert status string to enum if needed, but TypeScript checks should pass if it matches exactly
                    status: event.status as any,
                },
            });
            console.log(`Created event: ${event.title}`);
        } else {
            console.log(`Event already exists: ${event.title}`);
        }
    }

    // 3. Seed Gallery Images
    const galleryImages = [
        { title: 'Students celebrating', imageUrl: 'https://images.unsplash.com/photo-1575794887726-b72453e33ced?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFmcmljY2NhbiUyMFN0dWRlbnRzJTIwY2VsZWJyYXRpbmd8ZW58MHx8MHx8fDA%3D', category: 'Students', isFeatured: true },
        { title: 'Travel adventure', imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', category: 'Adventure', isFeatured: false },
        { title: 'Cultural experience', imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80', category: 'Culture', isFeatured: true },
        { title: 'Team collaboration', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80', category: 'Team', isFeatured: false },
        { title: 'Education guidance', imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80', category: 'Education', isFeatured: false },
        { title: 'Travel destination', imageUrl: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=80', category: 'Travel', isFeatured: true },
        { title: 'Student success', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', category: 'Success', isFeatured: false },
        { title: 'Scenic travel', imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80', category: 'Travel', isFeatured: false },
    ];

    for (const image of galleryImages) {
        // Check duplication by imageUrl to avoid duplicates on re-run
        const existing = await prisma.galleryImage.findFirst({ where: { imageUrl: image.imageUrl } });
        if (!existing) {
            await prisma.galleryImage.create({
                data: {
                    ...image,
                    uploadedById: admin.id,
                },
            });
            console.log(`Created gallery image: ${image.title}`);
        } else {
            console.log(`Gallery image already exists: ${image.title}`);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
