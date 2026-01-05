'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  content: string;
  rating: number | null;
  avatarUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = filter === 'featured' 
    ? testimonials.filter(t => t.isFeatured)
    : testimonials;

  const stats = {
    total: testimonials.length,
    featured: testimonials.filter(t => t.isFeatured).length,
    averageRating: testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
      : '5.0',
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-sm font-semibold text-primary">Client Testimonials</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                What Our <span className="text-primary">Clients</span> Say
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Real experiences from travelers, students, and families who trusted us with their journey
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <span className="text-4xl font-bold text-primary">{stats.averageRating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>

                <div className="h-16 w-px bg-border hidden sm:block" />

                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>

                <div className="h-16 w-px bg-border hidden sm:block" />

                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stats.featured}</div>
                  <p className="text-sm text-muted-foreground">Featured Stories</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                All Reviews ({stats.total})
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  filter === 'featured'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                }`}
              >
                <Star className="w-4 h-4" />
                Featured ({stats.featured})
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Quote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {filter === 'featured' ? 'No Featured Testimonials Yet' : 'No Testimonials Yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your experience with us!
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card rounded-2xl border-2 p-6 hover:shadow-xl transition-all ${
                      testimonial.isFeatured
                        ? 'border-primary bg-gradient-to-br from-primary/5 to-transparent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Featured Badge */}
                    {testimonial.isFeatured && (
                      <div className="flex justify-end mb-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Quote Icon */}
                    <Quote className="w-8 h-8 text-primary/20 mb-4" />

                    {/* Rating */}
                    {testimonial.rating && (
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= testimonial.rating!
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-foreground leading-relaxed mb-6">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      {testimonial.avatarUrl ? (
                        <img
                          src={testimonial.avatarUrl}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-2 border-primary/20">
                          <span className="text-lg font-bold text-white">
                            {testimonial.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                        {testimonial.title && (
                          <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <MessageSquare className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Share Your Experience
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have you traveled with us or used our services? We'd love to hear about your experience!
              </p>
              <a
                href="/profile/testimonials"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                <Star className="w-5 h-5" />
                Write a Testimonial
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
