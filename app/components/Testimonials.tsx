'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Carousel, { CarouselItem } from './Carousel';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  content: string;
  rating: number | null;
  avatarUrl: string | null;
  isFeatured: boolean;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<CarouselItem[]>([]);
  const [stats, setStats] = useState({
    averageRating: 4.9,
    totalReviews: 0,
    happyTravelers: 1000,
    studentsPlaced: 250,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data: Testimonial[] = await response.json();
        
        // Calculate stats from real testimonials
        const totalReviews = data.length;
        const ratingsSum = data.reduce((sum, t) => sum + (t.rating || 0), 0);
        const averageRating = totalReviews > 0 ? (ratingsSum / totalReviews).toFixed(1) : '4.9';
        
        setStats({
          averageRating: parseFloat(averageRating as string),
          totalReviews,
          happyTravelers: 1000,
          studentsPlaced: 250,
        });

        // Convert to carousel format
        const carouselItems: CarouselItem[] = data.map((t, index) => ({
          id: index + 1,
          title: t.name + (t.title ? ` - ${t.title}` : ''),
          description: t.content,
          icon: <Quote className="h-[16px] w-[16px] text-secondary" />,
          image: t.avatarUrl || undefined,
        }));

        setTestimonials(carouselItems);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Keep default empty state
    }
  };

  // Show section even if no testimonials yet (for demo purposes)
  const hasTestimonials = testimonials.length > 0;

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
              <span className="text-5xl font-bold text-primary">{stats.averageRating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-secondary text-secondary" />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">
              Based on {stats.totalReviews > 0 ? stats.totalReviews : '500+'} reviews
            </p>
          </div>

          <div className="h-16 w-px bg-border hidden md:block" />

          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-primary mb-2">{stats.happyTravelers}+</div>
            <p className="text-muted-foreground">Happy Travelers</p>
          </div>

          <div className="h-16 w-px bg-border hidden md:block" />

          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-primary mb-2">{stats.studentsPlaced}+</div>
            <p className="text-muted-foreground">Students Placed</p>
          </div>
        </motion.div>

        {/* Carousel */}
        {hasTestimonials ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <Quote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">
              No testimonials yet. Be the first to share your experience!
            </p>
          </motion.div>
        )}

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
