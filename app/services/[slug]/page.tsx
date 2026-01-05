'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { CheckCircle2, Loader2, ArrowLeft, Star, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Mail, GraduationCap, Calendar, MapPin, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Service {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  fullDescription: string | null;
  iconName: string | null;
  category: string | null;
  color: string | null;
  imageUrl: string | null;
  features: any;
  priceRange: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  country: string | null;
  university: string | null;
  duration: string | null;
  deadline: string | null;
  imageUrl: string | null;
  tuitionFee: string | null;
  applicationFee: string | null;
  scholarshipType: string | null;
  availableSlots: number | null;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = service?.title || '';
  const shareDescription = service?.description || '';

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDescription = encodeURIComponent(shareDescription);

    const shareLinks: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  useEffect(() => {
    if (slug) {
      fetchService();
    }
  }, [slug]);

  const fetchService = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        const foundService = data.find((s: Service) => s.slug === slug);
        if (foundService) {
          setService(foundService);
          // Fetch programs for this service
          fetchPrograms(foundService.id);
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/programs?serviceId=${serviceId}&active=true`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !service) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Service Not Found</h1>
            <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist.</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Services
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: service.color || '#10B981' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Services
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {service.tagline && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                        <Star className="w-4 h-4" />
                        {service.tagline}
                      </div>
                    )}

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                      {service.title}
                    </h1>
                  </div>

                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-3 bg-card hover:bg-muted border border-border rounded-full transition-colors"
                    >
                      <Share2 className="w-6 h-6 text-foreground" />
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <Facebook className="w-5 h-5 text-blue-600" />
                          <span className="text-foreground">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <Twitter className="w-5 h-5 text-sky-500" />
                          <span className="text-foreground">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <Linkedin className="w-5 h-5 text-blue-700" />
                          <span className="text-foreground">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare('email')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                        >
                          <Mail className="w-5 h-5 text-gray-600" />
                          <span className="text-foreground">Email</span>
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
                        >
                          <LinkIcon className="w-5 h-5 text-primary" />
                          <span className="text-foreground">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {service.description && (
                  <p className="text-xl text-muted-foreground mb-8">
                    {service.description}
                  </p>
                )}

                {service.priceRange && (
                  <div className="inline-block px-6 py-3 bg-card border border-border rounded-lg">
                    <span className="text-sm text-muted-foreground">Starting from</span>
                    <div className="text-2xl font-bold text-foreground">{service.priceRange}</div>
                  </div>
                )}
              </motion.div>

              {/* Image */}
              {service.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, ${service.color || '#10B981'}40, transparent)`
                    }}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-12 md:py-16 lg:py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Full Description */}
              {service.fullDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">Service Details</h2>
                  <div
                    className="prose prose-sm md:prose-lg max-w-none text-muted-foreground prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: service.fullDescription }}
                  />
                </motion.div>
              )}

              {/* Features */}
              {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">Key Features</h2>
                  <div className="space-y-3 md:space-y-4">
                    {service.features.map((feature: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <CheckCircle2
                          className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5"
                          style={{ color: service.color || '#10B981' }}
                        />
                        <span className="text-sm md:text-base text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        {programs.length > 0 && (
          <section className="py-12 md:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 md:mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  Available Programs
                </h2>
                <p className="text-muted-foreground text-lg">
                  Explore our {programs.length} program{programs.length !== 1 ? 's' : ''} under {service.title}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {programs.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Program Image */}
                    {program.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={program.imageUrl}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Scholarship Badge */}
                        {program.scholarshipType && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                            {program.scholarshipType}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Program Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {program.title}
                        </h3>
                        {program.tagline && (
                          <p className="text-sm text-muted-foreground">{program.tagline}</p>
                        )}
                      </div>

                      {program.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {program.description}
                        </p>
                      )}

                      {/* Program Details */}
                      <div className="space-y-2">
                        {program.country && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{program.country}</span>
                          </div>
                        )}
                        {program.university && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="line-clamp-1">{program.university}</span>
                          </div>
                        )}
                        {program.duration && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{program.duration}</span>
                          </div>
                        )}
                      </div>

                      {/* Fees */}
                      {(program.tuitionFee || program.applicationFee) && (
                        <div className="pt-4 border-t border-border space-y-1">
                          {program.tuitionFee && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tuition:</span>
                              <span className="font-semibold text-foreground">{program.tuitionFee}</span>
                            </div>
                          )}
                          {program.applicationFee && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Application:</span>
                              <span className="font-semibold text-foreground">{program.applicationFee}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Available Slots */}
                      {program.availableSlots !== null && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {program.availableSlots} slots available
                          </span>
                        </div>
                      )}

                      {/* Apply Button */}
                      <Link
                        href="/profile/applications/new"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors group/btn"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-primary to-accent rounded-xl md:rounded-2xl p-8 md:p-12 text-white text-center"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-base md:text-xl mb-6 md:mb-8 text-white/90 max-w-2xl mx-auto">
                Contact us today to learn more about {service.title}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors text-sm md:text-base"
                >
                  Contact Us
                </Link>
                <Link
                  href="/services"
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-white/10 border-2 border-white text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-sm md:text-base"
                >
                  View All Services
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
