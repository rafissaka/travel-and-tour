'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, Compass, MapPin, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 3,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: mousePosition.x,
            y: mousePosition.y
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: -mousePosition.x,
            y: -mousePosition.y
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating Icons */}
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            initial={{
              x: `${element.x}%`,
              y: `${element.y}%`,
              opacity: 0
            }}
            animate={{
              y: [`${element.y}%`, `${element.y - 20}%`, `${element.y}%`],
              opacity: [0, 0.3, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: 'easeInOut'
            }}
          >
            {element.id % 3 === 0 ? (
              <Plane className="text-primary" size={element.size} />
            ) : element.id % 3 === 1 ? (
              <Compass className="text-secondary" size={element.size} />
            ) : (
              <MapPin className="text-accent" size={element.size} />
            )}
          </motion.div>
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <motion.h1
            className="text-[150px] sm:text-[200px] md:text-[250px] lg:text-[300px] font-black leading-none"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--secondary)) 50%, rgb(var(--accent)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            404
          </motion.h1>

          {/* Floating Plane Around 404 */}
          <motion.div
            className="absolute top-1/2 left-1/2"
            animate={{
              x: ['-50%', '150%'],
              y: ['-50%', '-100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Plane className="text-primary w-12 h-12 sm:w-16 sm:h-16" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            Looks like you've ventured off the beaten path. This page seems to have taken an unexpected tour!
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't worry, we'll help you get back on track.
          </p>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search for tours, destinations, or services..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-card border-2 border-border text-card-foreground focus:outline-none focus:border-primary transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
                }
              }}
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="group flex items-center gap-3 px-8 py-4 bg-primary hover:bg-accent text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Go to Homepage
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="group flex items-center gap-3 px-8 py-4 bg-card hover:bg-muted border-2 border-border hover:border-primary text-card-foreground font-bold rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">Popular Destinations:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Cape Coast Tours', href: '/tours/cape-coast' },
              { name: 'Kumasi Heritage', href: '/tours/kumasi' },
              { name: 'Student Admissions', href: '/admissions' },
              { name: 'Contact Us', href: '/contact' }
            ].map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-card hover:bg-primary/10 border border-border hover:border-primary text-card-foreground hover:text-primary rounded-full text-sm transition-all"
              >
                {link.name}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Fun Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="inline-block text-6xl sm:text-7xl"
          >
            🧭
          </motion.div>
          <p className="mt-4 text-muted-foreground text-sm">
            Lost? Let's navigate together!
          </p>
        </motion.div>
      </div>

      {/* Animated Border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background: 'linear-gradient(90deg, rgb(var(--primary)), rgb(var(--secondary)), rgb(var(--accent)), rgb(var(--primary)))',
          backgroundSize: '200% 100%'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 0%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}
