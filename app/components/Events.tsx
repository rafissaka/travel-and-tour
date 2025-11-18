'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import InfiniteMenu from './InfiniteMenu';

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  duration: string;
  status: 'upcoming' | 'ended';
  category: 'tour' | 'education' | 'admission';
  link: string;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Accra - Cape Coast Tour',
    description: 'Start and End in Accra. Journey through Ghana\'s rich colonial history with guided tours of Cape Coast Castle and Elmina Castle, both UNESCO World Heritage Sites. Experience the Kakum National Park canopy walk, visit traditional fishing villages, and explore the vibrant coastal culture. Includes transportation, accommodation, meals, and expert local guides.',
    image: 'https://picsum.photos/seed/cape-coast/800/800',
    location: 'Accra to Cape Coast, Ghana',
    date: 'December 15, 2025',
    duration: '3 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/cape-coast',
  },
  {
    id: 2,
    title: 'Golden Heritage Tour',
    description: 'Experience Incredible Golden Royal Culture of Ghana. Visit the Manhyia Palace, explore the sacred Ashanti royal mausoleum, witness traditional Kente weaving, and attend a durbar with local chiefs. Tour includes visits to Kumasi Central Market, the National Cultural Centre, and traditional craft villages. Full board accommodation and cultural performances included.',
    image: 'https://picsum.photos/seed/golden-heritage/800/800',
    location: 'Kumasi, Ghana',
    date: 'September 10, 2024',
    duration: '5 Days',
    status: 'ended',
    category: 'tour',
    link: '/tours/golden-heritage',
  },
  {
    id: 3,
    title: 'School Admission Open',
    description: 'Applications now open for international student programs. Join world-class universities in Accra and Kumasi offering degrees in Engineering, Medicine, Business, Arts, and Sciences. Scholarship opportunities available for qualified students. Application includes visa support, accommodation assistance, and pre-arrival orientation. Early bird discount for applications before March 2026.',
    image: 'https://picsum.photos/seed/school-admission/800/800',
    location: 'Accra & Kumasi Universities',
    date: 'January 1, 2026',
    duration: 'Ongoing',
    status: 'upcoming',
    category: 'admission',
    link: '/admissions',
  },
  {
    id: 4,
    title: 'Kakum National Park',
    description: 'Walk the famous canopy walkway suspended 40 meters above the forest floor. Experience over 350 species of butterflies, 250 bird species, and observe forest elephants in their natural habitat. Includes guided nature walks, bird watching sessions, and overnight camping under the stars. Professional guides provide insights into the rainforest ecosystem and conservation efforts.',
    image: 'https://picsum.photos/seed/kakum-park/800/800',
    location: 'Kakum National Park, Ghana',
    date: 'November 20, 2025',
    duration: '2 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/kakum',
  },
  {
    id: 5,
    title: 'Mole Safari & Waterfalls',
    description: 'Explore Ghana\'s largest wildlife reserve with elephants, antelopes, warthogs, and over 300 bird species. Morning and evening safari walks with experienced rangers. Visit the breathtaking Wli Waterfalls, Ghana\'s highest waterfall cascading from 80 meters. Includes accommodation at Mole Motel, all meals, guided safaris, and cultural village visits. Photography opportunities guaranteed.',
    image: 'https://picsum.photos/seed/mole-safari/800/800',
    location: 'Northern & Volta Region, Ghana',
    date: 'February 5, 2026',
    duration: '4 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/mole-safari',
  },
  {
    id: 6,
    title: 'Study Abroad Workshop',
    description: 'Comprehensive workshop for students planning to study abroad. Learn about scholarship applications, visa processes, TOEFL/IELTS preparation, university selection, and financial planning. Guest speakers from international universities, successful alumni testimonials, one-on-one counseling sessions, and application review services. Receive workshop materials, university brochures, and follow-up support.',
    image: 'https://picsum.photos/seed/study-abroad/800/800',
    location: 'Accra Conference Center',
    date: 'August 15, 2024',
    duration: '1 Day',
    status: 'ended',
    category: 'education',
    link: '/workshops/study-abroad',
  },
  {
    id: 7,
    title: 'Volta Cultural Immersion',
    description: 'Immerse in traditional Ewe culture with homestay experiences in local villages. Learn traditional drumming and dancing, participate in authentic Kente weaving workshops, attend traditional naming ceremonies, and enjoy home-cooked Ewe cuisine. Visit historical sites in Ho and Keta, explore the Keta Lagoon, and experience the Volta Region\'s warm hospitality. Cultural certificate awarded.',
    image: 'https://picsum.photos/seed/volta-culture/800/800',
    location: 'Ho & Keta, Volta Region',
    date: 'January 18, 2026',
    duration: '3 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/volta-culture',
  },
  {
    id: 8,
    title: 'Ghana Education Fair',
    description: 'Meet representatives from over 50 top universities and colleges from Ghana, UK, USA, Canada, and Europe. Explore undergraduate and postgraduate programs, professional courses, and vocational training. On-site application processing, scholarship information sessions, visa guidance workshops, and career counseling. Special presentations on emerging fields and study abroad financing options.',
    image: 'https://picsum.photos/seed/education-fair/800/800',
    location: 'Accra International Conference Centre',
    date: 'October 8, 2025',
    duration: '2 Days',
    status: 'upcoming',
    category: 'education',
    link: '/events/education-fair',
  },
  {
    id: 9,
    title: 'Beaches & Coastal Tour',
    description: 'Relax on Ghana\'s pristine beaches at Busua and Kokrobite. Enjoy surfing lessons, beach volleyball, kayaking, and sunset boat cruises. Visit traditional fishing communities, experience beach bonfires with live reggae music, and taste fresh seafood at beachside restaurants. Includes beachfront resort accommodation, water sports equipment, and guided coastal village tours.',
    image: 'https://picsum.photos/seed/beaches-tour/800/800',
    location: 'Western & Greater Accra Coast',
    date: 'March 10, 2026',
    duration: '3 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/beaches',
  },
  {
    id: 10,
    title: 'Student Exchange Program',
    description: 'Past international exchange program connecting students globally for cultural learning, academic excellence, and networking. Participants experienced cross-cultural education, language immersion, host family stays, and international university credits. Program included pre-departure orientation, monthly cultural activities, academic support, and career development workshops. Alumni network remains active.',
    image: 'https://picsum.photos/seed/exchange-program/800/800',
    location: 'Multiple Countries',
    date: 'July 20, 2024',
    duration: '6 Months',
    status: 'ended',
    category: 'education',
    link: '/programs/exchange',
  },
  {
    id: 11,
    title: 'Elmina Castle History Tour',
    description: 'UNESCO World Heritage site with deep historical significance. Guided tour through the oldest European building in Sub-Saharan Africa, built in 1482. Explore the slave dungeons, learn about the Trans-Atlantic slave trade, visit the governor\'s quarters, and reflect at the Door of No Return. Includes museum exhibits, historical documentation, and memorial ceremonies. Expert historians provide context and answer questions.',
    image: 'https://picsum.photos/seed/elmina-castle/800/800',
    location: 'Elmina, Central Region, Ghana',
    date: 'March 22, 2026',
    duration: '1 Day',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/elmina-castle',
  },
  {
    id: 12,
    title: 'Nzulezu Stilt Village Tour',
    description: 'Visit Ghana\'s unique village built entirely on stilts over Lake Tadane. Canoe journey through mangrove forests to reach this 400-year-old community. Experience daily life on water, visit the stilt school and church, learn traditional fishing methods, and enjoy local cuisine prepared over water. Interact with friendly villagers, purchase handmade crafts, and learn about sustainable water-based living.',
    image: 'https://picsum.photos/seed/nzulezu-village/800/800',
    location: 'Western Region, Ghana',
    date: 'April 5, 2026',
    duration: '2 Days',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/nzulezu',
  },
  {
    id: 13,
    title: 'Aburi Botanical Gardens',
    description: 'Explore 160 acres of beautiful botanical gardens in the cool mountain climate of Aburi. Discover over 600 plant species including exotic palms, flowering trees, medicinal plants, and rare orchids. Walk through the famous palm avenue, visit the historic Governor\'s Lodge, enjoy panoramic views of the surrounding hills, and learn about Ghana\'s flora. Picnic facilities and guided botanical tours available.',
    image: 'https://picsum.photos/seed/aburi-gardens/800/800',
    location: 'Aburi, Eastern Region, Ghana',
    date: 'May 12, 2026',
    duration: '1 Day',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/aburi',
  },
  {
    id: 14,
    title: 'Boti Falls Adventure',
    description: 'Discover the spectacular twin waterfalls plunging 30 meters in a lush forest setting. Hike to the Umbrella Rock formation for stunning views, swim in the natural pool beneath the falls, and explore the mystical caves. Visit the Three-Headed Palm Tree, a natural wonder unique to this region. Includes nature walks, bird watching, and visits to nearby cocoa farms. Photography paradise with countless scenic spots.',
    image: 'https://picsum.photos/seed/boti-falls/800/800',
    location: 'Eastern Region, Ghana',
    date: 'June 8, 2026',
    duration: '1 Day',
    status: 'upcoming',
    category: 'tour',
    link: '/tours/boti-falls',
  },
  {
    id: 15,
    title: 'Kumasi Cultural Festival',
    description: 'Past vibrant Ashanti cultural celebration featuring the Asantehene (Ashanti King) and paramount chiefs in full traditional regalia. Festival included Adowa dance performances, fontomfrom drumming, Kente cloth displays, and traditional Ashanti ceremonies. Attendees experienced royal processions, cultural exhibitions, craft demonstrations, and authentic Ashanti cuisine. Cultural immersion at its finest.',
    image: 'https://picsum.photos/seed/kumasi-festival/800/800',
    location: 'Kumasi, Ashanti Region',
    date: 'July 1, 2024',
    duration: '3 Days',
    status: 'ended',
    category: 'tour',
    link: '/tours/kumasi-festival',
  },
];

export function Events() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ended'>('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  // Transform events to InfiniteMenu format
  const menuItems = filteredEvents.map(event => ({
    image: event.image,
    link: event.link,
    title: event.title,
    description: event.description,
  }));

  return (
    <section className="py-20 bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Events & <span className="text-secondary">Opportunities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover upcoming tours, educational programs, and admission opportunities
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-card text-card-foreground hover:bg-muted border border-border'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-card text-card-foreground hover:bg-muted border border-border'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'ended'
                ? 'bg-primary text-white'
                : 'bg-card text-card-foreground hover:bg-muted border border-border'
            }`}
          >
            Ended
          </button>
        </div>

        {/* InfiniteMenu 3D Globe */}
        <div className="w-full h-[700px] relative">
          <InfiniteMenu items={menuItems} />
        </div>

        {/* Event Details Grid Below */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 space-y-3 border border-border hover:border-primary transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">{event.title}</h3>
                {event.status === 'upcoming' ? (
                  <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={12} />
                    Upcoming
                  </div>
                ) : (
                  <div className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <XCircle size={12} />
                    Ended
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-secondary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-secondary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-secondary" />
                  <span>{event.duration}</span>
                </div>
              </div>

              {event.status === 'upcoming' ? (
                <button className="w-full bg-primary hover:bg-accent text-white font-bold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                  Book Now
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button className="w-full bg-muted hover:bg-border text-card-foreground font-bold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                  View Course
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
