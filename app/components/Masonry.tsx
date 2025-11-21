'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MasonryItem {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  category: string | null;
  isFeatured: boolean;
}

export function Masonry() {
  const [images, setImages] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Assign varying heights for masonry effect (tall, medium, short)
  const getHeightClass = (index: number) => {
    // Pattern: tall, short, medium, tall, medium, short, medium, tall, short...
    const patterns = [
      'row-span-3',  // tall
      'row-span-1',  // short
      'row-span-2',  // medium
      'row-span-3',  // tall
      'row-span-2',  // medium
      'row-span-1',  // short
      'row-span-2',  // medium
      'row-span-3',  // tall
      'row-span-1',  // short
    ];
    return patterns[index % patterns.length];
  };

  // Strip HTML tags from description for display
  const stripHtml = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="h-12 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 rounded-lg w-3/4 mx-auto mb-4 animate-shimmer bg-[length:200%_100%]" />
            <div className="h-6 bg-gradient-to-r from-muted/10 via-muted/30 to-muted/10 rounded-lg w-1/2 mx-auto animate-shimmer bg-[length:200%_100%]" />
          </motion.div>

          {/* Masonry Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {[...Array(12)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`relative overflow-hidden rounded-2xl bg-muted/10 ${getHeightClass(
                  index
                )}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer bg-[length:200%_100%]" />
                <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Gallery coming soon</p>
          </div>
        </div>
      </section>
    );
  }

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
          {images.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${getHeightClass(
                index
              )}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <img
                src={item.imageUrl}
                alt={item.title || 'Gallery image'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Featured Badge */}
              {item.isFeatured && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg">
                  Featured
                </div>
              )}

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
                  hoveredId === item.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-base mb-1">
                    {item.title || 'Untitled'}
                  </p>
                  {item.category && (
                    <p className="text-primary text-xs font-medium mb-1">{item.category}</p>
                  )}
                  {item.description && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {stripHtml(item.description)}
                    </p>
                  )}
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
