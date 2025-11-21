'use client';

import { Navbar } from './components/Navbar';
import { Masonry } from './components/Masonry';
import { Events } from './components/Events';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { Plane, GraduationCap, Globe, MapPin, Award, Users } from 'lucide-react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinary-loader';

// Generate floating elements outside component
const generateFloatingElements = () =>
  Array.from({ length: 15 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 3,
  }));

export default function Home() {
  // Use lazy initialization to generate elements only once
  const [floatingElements] = useState(generateFloatingElements);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    { icon: Plane, title: 'Travel', description: 'Worldwide Tours' },
    { icon: GraduationCap, title: 'Education', description: 'Learn & Grow' },
    { icon: Globe, title: 'Global', description: '50+ Countries' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-0 relative overflow-hidden bg-gray-900 dark:bg-gray-900">
        {/* Hero Section with Interactive Background */}
        <div className="relative min-h-screen flex items-center justify-center">
          {/* Background Image with Parallax Effect */}
          <motion.div
            className="absolute inset-0 -z-10 overflow-hidden"
            style={{ y }}
          >
            {/* Multiple layered backgrounds for depth */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            />

            {/* Gradient Overlays - Much lighter */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/40" />
          </motion.div>

          {/* Hero Content */}
          <motion.div
            className="w-full px-4 sm:px-6 lg:px-8 py-32 relative z-10"
            style={{ opacity }}
          >
            {/* Background container with full width */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: 'url(/1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
              {/* Left Side - Photo Collage */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] lg:h-[600px]"
              >
                {/* Main Photo - Top */}
                <motion.div
                  className="absolute top-0 left-10 w-[350px] h-[250px] transform -rotate-6 z-20"
                  whileHover={{ rotate: -3, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                    <Image
                      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800"
                      alt="Travel destination"
                      fill
                      priority
                      sizes="350px"
                      loader={cloudinaryLoader}
                      className="object-cover"
                    />
                  </div>
                </motion.div>

                {/* Second Photo - Bottom Left with Yellow Banner */}
                <motion.div
                  className="absolute bottom-20 left-0 w-[300px] h-[220px] transform rotate-3 z-10"
                  whileHover={{ rotate: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                    <Image
                      src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800"
                      alt="Group travel"
                      fill
                      priority
                      sizes="300px"
                      loader={cloudinaryLoader}
                      className="object-cover"
                    />
                    {/* Yellow Discount Banner */}
                    <div className="absolute bottom-4 left-4 right-4 bg-yellow-400 text-gray-900 px-4 py-3 rounded-lg shadow-lg z-10">
                      <div className="text-sm font-bold">Get Up</div>
                      <div className="text-2xl font-black">20% Discount</div>
                    </div>
                  </div>
                </motion.div>

                {/* Blue Frame - Accent */}
                <div className="absolute top-16 -left-4 w-32 h-48 bg-blue-500/80 rounded-lg transform rotate-12 z-0"></div>
              </motion.div>

              {/* Right Side - Text Content */}
              <div className="space-y-8 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Small heading */}
                  <h2 className="text-2xl md:text-3xl text-white dark:text-white font-medium italic">
                    It&apos;s <span className="font-bold">TIME</span> TO
                  </h2>

                  {/* Large Learn text */}
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black italic leading-none">
                    <span className="text-yellow-400 dark:text-yellow-400">Learn</span>
                  </h1>

                  {/* Travel text */}
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black italic leading-none text-white dark:text-white">
                    Travel
                  </h1>

                  {/* EXPLORE text */}
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic leading-none text-white dark:text-white">
                    & EXPLORE
                  </h1>

                  {/* Description */}
                  <p className="text-gray-300 dark:text-gray-300 text-lg md:text-xl max-w-md leading-relaxed pt-4">
                    Empowering students through quality education, unforgettable travel experiences, and guided tours worldwide. Your journey to knowledge and adventure starts here.
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="pt-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-yellow-400 dark:bg-yellow-400 text-gray-900 dark:text-gray-900 font-bold text-lg px-10 py-5 rounded-full hover:bg-yellow-300 dark:hover:bg-yellow-300 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50 uppercase tracking-wide flex items-center gap-3"
                  >
                    Get Started Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Masonry Gallery Section */}
        <Masonry />

        {/* Events Section */}
        <Events />

        {/* Testimonials Section */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
