'use client';

import { motion } from 'framer-motion';
import Carousel, { CarouselItem } from './Carousel';
import { Star, Quote } from 'lucide-react';

const testimonials: CarouselItem[] = [
  {
    id: 1,
    title: 'Sarah Johnson',
    description: 'The Cape Coast tour was absolutely incredible! Our guide was knowledgeable and the experience at Elmina Castle was deeply moving. God First Education made everything seamless from booking to the actual tour. Highly recommend!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 2,
    title: 'Michael Osei',
    description: 'I enrolled my daughter through God First Education for university admission. The process was smooth, and they provided excellent support with visa applications and accommodation. She\'s now thriving at the University of Ghana!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 3,
    title: 'Emily Chen',
    description: 'The Mole Safari exceeded all expectations! Seeing elephants in their natural habitat was breathtaking. The combination of wildlife and the Wli Waterfalls made this a trip of a lifetime. Thank you God First Education!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 4,
    title: 'Kwame Mensah',
    description: 'God First Education organized our school\'s field trip to Kakum National Park. The canopy walk was thrilling for our students, and the educational value was immense. Professional service throughout!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 5,
    title: 'Jessica Williams',
    description: 'The Golden Heritage Tour in Kumasi was a cultural immersion like no other. Learning about Ashanti traditions, witnessing Kente weaving, and attending the durbar was unforgettable. Five stars!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 6,
    title: 'David Agyeman',
    description: 'As an international student, God First Education helped me navigate the admission process seamlessly. They handled everything from applications to accommodation, making my transition to Ghana smooth and stress-free.',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 7,
    title: 'Aisha Mohammed',
    description: 'The Volta Cultural Immersion was an eye-opening experience. Living with local families, learning traditional drumming, and participating in cultural ceremonies gave me a deeper appreciation for Ghanaian culture.',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 8,
    title: 'Robert Thompson',
    description: 'Beaches & Coastal Tour was exactly what we needed! Busua Beach was pristine, surfing lessons were fun, and the beachside seafood was delicious. God First Education thinks of everything!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 9,
    title: 'Grace Boateng',
    description: 'The Education Fair organized by God First was incredibly helpful. I met representatives from multiple universities and got on-site admission! The scholarship guidance was invaluable.',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  },
  {
    id: 10,
    title: 'James Anderson',
    description: 'Nzulezu Stilt Village tour was unique and fascinating. The canoe ride through mangroves and experiencing life on water was unlike anything I\'ve seen. Exceptional tour organization!',
    icon: <Quote className="h-[16px] w-[16px] text-secondary" />
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-muted dark:bg-muted">
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
            What Our <span className="text-primary">Clients</span> Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from travelers, students, and families who trusted us with their journey
          </p>
        </motion.div>

        {/* Ratings Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-5xl font-bold text-primary">4.9</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">Based on 500+ reviews</p>
          </div>

          <div className="h-16 w-px bg-border hidden md:block" />

          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-primary mb-2">1000+</div>
            <p className="text-muted-foreground">Happy Travelers</p>
          </div>

          <div className="h-16 w-px bg-border hidden md:block" />

          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-primary mb-2">250+</div>
            <p className="text-muted-foreground">Students Placed</p>
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <Carousel
            items={testimonials}
            baseWidth={500}
            autoplay={true}
            autoplayDelay={5000}
            pauseOnHover={true}
            loop={true}
            round={false}
          />
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Trusted By</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-card-foreground font-semibold">University of Ghana</div>
            <div className="text-card-foreground font-semibold">KNUST</div>
            <div className="text-card-foreground font-semibold">Ghana Tourism Authority</div>
            <div className="text-card-foreground font-semibold">UNESCO Heritage Sites</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
