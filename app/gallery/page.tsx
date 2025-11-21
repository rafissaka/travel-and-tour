'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import cloudinaryLoader from '@/lib/cloudinary-loader';

interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  category: string | null;
  isFeatured: boolean;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});

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

  const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter((cat): cat is string => Boolean(cat))))];
  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  const stripHtml = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  const handlePrevious = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredImages[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredImages]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Photo <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse through our collection of memorable moments and experiences
            </p>
          </motion.div>

          {/* Category Filter */}
          {!loading && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'bg-card text-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative aspect-square rounded-2xl bg-muted/10 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer bg-[length:200%_100%]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && images.length === 0 && (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No images in gallery yet</p>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && filteredImages.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredImages.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedImage(item)}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                >
                  {/* Skeleton loader */}
                  {!imageLoadStates[item.id] && (
                    <div className="absolute inset-0 bg-muted/20 animate-pulse z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                  )}

                  {/* Image */}
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Gallery image'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    loader={cloudinaryLoader}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => setImageLoadStates(prev => ({ ...prev, [item.id]: true }))}
                  />

                  {/* Featured Badge */}
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20 shadow-lg">
                      Featured
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-base mb-1">
                        {item.title || 'Untitled'}
                      </p>
                      {item.category && (
                        <p className="text-primary text-xs font-medium">{item.category}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* No results for filter */}
          {!loading && images.length > 0 && filteredImages.length === 0 && (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No images found in this category</p>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[10001]"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[10001]"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[10001]"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Image Container */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-6xl w-full h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title || 'Gallery image'}
                  fill
                  sizes="100vw"
                  loader={cloudinaryLoader}
                  className="object-contain"
                  priority
                />

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedImage.title || 'Untitled'}
                  </h3>
                  {selectedImage.category && (
                    <p className="text-primary font-medium mb-2">{selectedImage.category}</p>
                  )}
                  {selectedImage.description && (
                    <p className="text-white/90 text-sm">
                      {stripHtml(selectedImage.description)}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
