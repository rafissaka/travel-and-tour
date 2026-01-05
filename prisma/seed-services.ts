import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  {
    title: 'Family Travel Consultation',
    slug: 'family-travel',
    tagline: 'PRIVATE ADVENTURES',
    description: 'Personalized travel planning for families seeking memorable experiences together.',
    fullDescription: '<p>Our Family Travel Consultation service offers personalized travel planning designed specifically for families. We understand that traveling with children requires special attention to detail, from choosing family-friendly accommodations to planning age-appropriate activities.</p><p>We work closely with you to create itineraries that keep everyone happy, ensuring your family vacation is both relaxing and exciting.</p>',
    iconName: 'Users',
    category: 'family-travel',
    color: '#10B981',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
    features: [
      'Custom itineraries for all ages',
      'Family-friendly accommodations',
      'Kid-approved activities',
      'Safety-first approach'
    ],
    priceRange: '₵600 - ₵2,000',
    isActive: true,
    displayOrder: 1
  },
  {
    title: 'Study & Summer Programs Abroad',
    slug: 'study-programs',
    tagline: 'DEDICATED SUPPORT',
    description: 'Educational programs that combine learning with cultural immersion.',
    fullDescription: '<p>Our Study & Summer Programs Abroad service provides students with unique opportunities to enhance their education through international experiences. We partner with prestigious institutions worldwide to offer programs that combine academic excellence with cultural immersion.</p><p>From language courses to specialized academic programs, we handle all the logistics including enrollment, accommodation, and visa assistance.</p>',
    iconName: 'GraduationCap',
    category: 'study-programs',
    color: '#3B82F6',
    imageUrl: 'https://images.unsplash.com/photo-1630569265403-9f38855679fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U3R1ZHklMjAlMjYlMjBTdW1tZXIlMjBQcm9ncmFtcyUyMEFicm9hZHxlbnwwfHwwfHx8MA%3D%3D',
    features: [
      'Academic excellence programs',
      'Cultural exchange opportunities',
      'Language immersion courses',
      '24/7 student support'
    ],
    priceRange: '₵8,000 - ₵40,000',
    isActive: true,
    displayOrder: 2
  },
  {
    title: 'International & Domestic Tours',
    slug: 'tours',
    tagline: 'EXCLUSIVE ADVENTURES',
    description: 'Curated tours showcasing the best destinations across Ghana and beyond.',
    fullDescription: '<p>Experience the world with our carefully curated International & Domestic Tours. Whether you want to explore the rich culture and heritage of Ghana or venture to international destinations, our expert guides ensure you get the most authentic experiences.</p><p>Our small group tours provide intimate experiences with local cultures, hidden gems, and must-see attractions. Each tour is designed to create lasting memories.</p>',
    iconName: 'Compass',
    category: 'tours',
    color: '#F59E0B',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
    features: [
      'Expert local guides',
      'Small group experiences',
      'Hidden gem locations',
      'Cultural authenticity'
    ],
    priceRange: '₵1,200 - ₵20,000',
    isActive: true,
    displayOrder: 3
  },
  {
    title: 'Hotel & Flight Reservations',
    slug: 'reservations',
    tagline: 'EVERYTHING YOU NEED',
    description: 'Seamless booking services for your travel accommodation and flights.',
    fullDescription: '<p>Let us handle all your booking needs with our Hotel & Flight Reservations service. We have partnerships with hotels and airlines worldwide, allowing us to offer competitive rates and exclusive perks.</p><p>From budget-friendly options to luxury accommodations, we find the perfect fit for your travel style and budget. Our service includes flexible cancellation policies and 24/7 booking support.</p>',
    iconName: 'Hotel',
    category: 'reservations',
    color: '#8B5CF6',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    features: [
      'Best price guarantees',
      'Premium partnerships',
      'Flexible cancellation',
      'VIP upgrades available'
    ],
    priceRange: 'Variable',
    isActive: true,
    displayOrder: 4
  },
  {
    title: 'International Travel & Visa Assistance',
    slug: 'visa-assistance',
    tagline: 'PERSONALIZED APPROACH',
    description: 'Expert guidance through visa applications and travel documentation.',
    fullDescription: '<p>Navigating visa requirements and travel documentation can be complex. Our International Travel & Visa Assistance service simplifies the process with expert guidance every step of the way.</p><p>We help with application preparation, document verification, embassy coordination, and provide updates throughout the process. Our high success rate speaks to our expertise and attention to detail.</p>',
    iconName: 'Globe',
    category: 'visa-assistance',
    color: '#EF4444',
    imageUrl: 'https://images.unsplash.com/photo-1655722724170-b3ab67a48791?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8SW50ZXJuYXRpb25hbCUyMFRyYXZlbCUyMCUyNiUyMFZpc2ElMjBBc3Npc3RhbmNlfGVufDB8fDB8fHww',
    features: [
      'Visa application support',
      'Document verification',
      'Embassy coordination',
      'Travel insurance advice'
    ],
    priceRange: '₵400 - ₵3,200',
    isActive: true,
    displayOrder: 5
  },
  {
    title: 'Itinerary Planning',
    slug: 'itinerary',
    tagline: 'EXCEEDING EXPECTATIONS',
    description: 'Meticulously crafted travel plans tailored to your preferences.',
    fullDescription: '<p>Our Itinerary Planning service creates personalized travel plans that match your interests, budget, and schedule. We handle all the details, from daily schedules to restaurant reservations, ensuring nothing is left to chance.</p><p>Whether you want a packed adventure or a relaxed getaway, we design itineraries that maximize your time and create unforgettable experiences.</p>',
    iconName: 'Map',
    category: 'itinerary',
    color: '#06B6D4',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
    features: [
      'Customized schedules',
      'Budget optimization',
      'Activity coordination',
      'Real-time adjustments'
    ],
    priceRange: '₵200 - ₵1,200',
    isActive: true,
    displayOrder: 6
  }
];

async function main() {
  console.log('Start seeding services...');

  // Get the first admin user to assign as creator
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' }
      ]
    }
  });

  if (!adminUser) {
    console.log('No admin user found. Please create an admin user first.');
    return;
  }

  for (const service of services) {
    const existing = await prisma.service.findUnique({
      where: { slug: service.slug }
    });

    if (existing) {
      console.log(`Service "${service.title}" already exists, skipping...`);
      continue;
    }

    const created = await prisma.service.create({
      data: {
        ...service,
        createdById: adminUser.id
      }
    });

    console.log(`Created service: ${created.title}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
