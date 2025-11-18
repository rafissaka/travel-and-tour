'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface MasonryItem {
  id: number;
  src: string;
  alt: string;
  description: string;
  height: 'tall' | 'short' | 'medium';
}

const masonryImages: MasonryItem[] = [
  {
    id: 1,
    src: 'https://static.wixstatic.com/media/3c6015a9d0c348c4a6ad93f8bd33158e.jpg/v1/fill/w_375,h_375,fp_0.50_0.50,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/3c6015a9d0c348c4a6ad93f8bd33158e.jpg',
    alt: 'Four-Day Caribbean Cruise',
    description: 'Experience luxury travel with our exclusive Caribbean cruise packages',
    height: 'tall',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    alt: 'Kakum National Park Canopy Walk',
    description: 'Walk among the treetops on Ghana\'s famous canopy walkway adventure',
    height: 'short',
  },
  {
    id: 3,
    src: 'https://static.wixstatic.com/media/11062b_858d8caee7ce4ece9db5a3cdd3cb83af~mv2.jpg/v1/fill/w_375,h_375,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_858d8caee7ce4ece9db5a3cdd3cb83af~mv2.jpg',
    alt: 'Dubai City and Private Tour',
    description: 'Explore the modern marvels and luxury of Dubai with guided tours',
    height: 'medium',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    alt: 'Student Exchange Programs',
    description: 'International student exchange programs for cultural learning and growth',
    height: 'short',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1721011694126-e25f493b91f1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RWxtaW5hJTIwQ2FzdGxlJTIwVG91ciUyMEdoYW5hfGVufDB8fDB8fHww',
    alt: 'Elmina Castle Tour Ghana',
    description: 'Discover Ghana\'s rich history at the UNESCO World Heritage Elmina Castle',
    height: 'tall',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
    alt: 'Cape Coast Castle Historical Tour',
    description: 'Journey through history at Cape Coast Castle, a powerful heritage site',
    height: 'medium',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800',
    alt: 'Academic Excellence Programs',
    description: 'Empowering students with world-class educational opportunities abroad',
    height: 'short',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    alt: 'Mole National Park Safari',
    description: 'Experience Ghana\'s wildlife with elephants, antelopes, and exotic birds',
    height: 'tall',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    alt: 'Accra City Cultural Tour',
    description: 'Explore Ghana\'s vibrant capital with markets, museums, and cultural sites',
    height: 'medium',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    alt: 'School Field Trips Ghana',
    description: 'Educational field trips to historical and cultural landmarks across Ghana',
    height: 'short',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    alt: 'Wli Waterfalls Adventure',
    description: 'Hike to Ghana\'s highest waterfall in the Volta Region for breathtaking views',
    height: 'medium',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1604781537288-5f60ebaf9784?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFVuaXZlcnNpdHklMjBDYW1wdXMlMjBUb3VycyUyMGJsYWNrc3R1ZGVudHxlbnwwfHwwfHx8MA%3D%3D',
    alt: 'University Campus Tours',
    description: 'Visit top universities and colleges for prospective students and families',
    height: 'tall',
  },
  {
    id: 13,
    src: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    alt: 'Volta Region Cultural Experience',
    description: 'Immerse in traditional Ghanaian culture with visits to local villages and crafts',
    height: 'tall',
  },
  {
    id: 14,
    src: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    alt: 'Educational Workshops & Seminars',
    description: 'Interactive learning sessions and skill development workshops for students',
    height: 'medium',
  },
  {
    id: 15,
    src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    alt: 'Beaches of Ghana',
    description: 'Relax on Ghana\'s pristine beaches including Busua and Kokrobite',
    height: 'short',
  },
];

export function Masonry() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getHeightClass = (height: string) => {
    switch (height) {
      case 'tall':
        return 'row-span-2';
      case 'short':
        return 'row-span-1';
      case 'medium':
        return 'row-span-1';
      default:
        return 'row-span-1';
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Journey</span> in Pictures
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the moments we&apos;ve shared with students, travelers, and adventurers around the world
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {masonryImages.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${getHeightClass(
                item.height
              )}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
                  hoveredId === item.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-base mb-1">{item.alt}</p>
                  <p className="text-white/90 text-sm">{item.description}</p>
                </div>
              </div>

              {/* Border accent on hover */}
              <div
                className={`absolute inset-0 border-4 border-primary rounded-2xl transition-opacity duration-300 ${
                  hoveredId === item.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
