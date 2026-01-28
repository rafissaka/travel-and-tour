'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { CheckCircle2, Loader2, ArrowLeft, Star, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Mail, GraduationCap, Calendar, MapPin, Building2, ArrowRight, X, Eye, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ConsultationForm from '@/app/components/ConsultationForm';
import VisaAssistanceForm from '@/app/components/VisaAssistanceForm';
import ItineraryPlanningForm from '@/app/components/ItineraryPlanningForm';
import ReservationsBooking from '@/app/components/ReservationsBooking';
import { toast } from 'sonner';

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
  fullDescription: string | null;
  country: string | null;
  university: string | null;
  duration: string | null;
  deadline: string | null;
  imageUrl: string | null;
  tuitionFee: string | null;
  applicationFee: string | null;
  scholarshipType: string | null;
  availableSlots: number | null;
  features: any;
  requirements: any;
  benefits: any;
  programRequirements: any[];
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  price: number | null;
  maxParticipants: number | null;
  currentParticipants: number;
  status: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showProgramDetails, setShowProgramDetails] = useState(false);

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
      checkAuth();
      if (slug === 'tours') {
        fetchEvents();
      }
    }
  }, [slug]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      setIsLoggedIn(response.ok);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleConsultClick = () => {
    // Allow form to open for all users, check auth on submit
    setShowConsultationModal(true);
  };

  const handleViewProgram = (program: Program) => {
    setSelectedProgram(program);
    setShowProgramDetails(true);
  };

  const handleApplyNow = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to apply');
      router.push('/auth/login?redirect=/services/' + slug);
      return;
    }
    router.push('/profile/applications/new');
  };

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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Filter only upcoming and ongoing events
        const activeEvents = data.filter((e: Event) => e.status === 'UPCOMING' || e.status === 'ONGOING');
        setEvents(activeEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
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
        {/* Reservations Booking Section - Moved to Top */}
        {service.slug === 'reservations' && (
          <section className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Services
              </Link>

              {/* Hero Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="inline-block mb-4">
                  <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full border-2 border-blue-200 dark:border-blue-800">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-blue-600 text-sm">
                      Book Your Dream Trip
                    </span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Find & Book Your Travel
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Search flights and hotels worldwide with{' '}
                  <span className="font-bold text-green-600">live pricing in Ghana Cedis (GH₵)</span>
                  <br className="hidden sm:block" />
                  Get instant quotes and amazing package deals
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg py-3 px-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Real-time Pricing</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg py-3 px-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Package Discounts (5%)</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg py-3 px-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Easy Search</span>
                  </div>
                </div>
              </motion.div>

              {/* Booking Interface */}
              <ReservationsBooking
                isLoggedIn={isLoggedIn}
                onLoginRequired={() => {
                  toast.info('Please log in to book your selection');
                  router.push('/auth/login?redirect=/services/reservations');
                }}
              />
            </div>
          </section>
        )}

        {/* Hero Section - For Non-Reservation Services */}
        {service.slug !== 'reservations' && (
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

                {/* Consultation Buttons for Services */}
                {service.slug === 'family-travel' && (
                  <button
                    onClick={handleConsultClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Consultation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                
                {service.slug === 'visa-assistance' && (
                  <button
                    onClick={handleConsultClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Calendar className="w-5 h-5" />
                    Request Visa Assistance
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                
                {service.slug === 'itinerary' && (
                  <button
                    onClick={handleConsultClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Calendar className="w-5 h-5" />
                    Plan My Itinerary
                    <ArrowRight className="w-5 h-5" />
                  </button>
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
        )}

        {/* Details Section - Only for Non-Reservation Services */}
        {service.slug !== 'reservations' && (
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
        )}

        {/* Events Section for Tours */}
        {service.slug === 'tours' && (
          <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 md:mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Calendar className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  Available Tour Events
                </h2>
                <p className="text-muted-foreground text-lg">
                  {events.length > 0 
                    ? `Discover our ${events.length} upcoming tour event${events.length !== 1 ? 's' : ''}`
                    : 'Check back soon for upcoming tour events'}
                </p>
              </motion.div>

              {events.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">No Events Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We're currently planning exciting tour events. Check back soon or contact us for custom tour arrangements.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                      onClick={() => router.push(`/events/${event.slug}`)}
                      className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      {/* Event Image */}
                      {event.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            {event.status}
                          </div>
                        </div>
                      )}

                      {/* Event Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {event.description}
                          </p>
                        )}

                        {/* Event Details */}
                        <div className="space-y-2">
                          {event.startDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{new Date(event.startDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          {event.price && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary text-lg">
                                GH₵ {Number(event.price).toFixed(2)}
                              </span>
                              <span className="text-xs">per person</span>
                            </div>
                          )}
                        </div>

                        {/* Available Spots */}
                        {event.maxParticipants && (
                          <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Available Spots:</span>
                              <span className="text-sm font-semibold text-foreground">
                                {event.maxParticipants - event.currentParticipants} / {event.maxParticipants}
                              </span>
                            </div>
                            <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-500"
                                style={{ 
                                  width: `${(event.currentParticipants / event.maxParticipants) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Book Now Button */}
                        <button
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          Book Now
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewProgram(program)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors group/btn"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={handleApplyNow}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors group/btn"
                        >
                          Apply Now
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
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

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConsultationModal(false);
            }
          }}
        >
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden bg-card rounded-2xl shadow-2xl border border-border animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-border backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-foreground">
                {service?.title || 'Consultation Request'}
              </h2>
              <button
                onClick={() => setShowConsultationModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors group"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] px-6 py-4">
              <ConsultationForm
                serviceId={service?.id || ''}
                serviceTitle={service?.title || ''}
                onClose={() => setShowConsultationModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      {showProgramDetails && selectedProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProgramDetails(false);
              setSelectedProgram(null);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card rounded-2xl shadow-2xl border-2 border-border"
          >
            {/* Header with Image */}
            {selectedProgram.imageUrl && (
              <div className="relative h-64 overflow-hidden">
                <img
                  src={selectedProgram.imageUrl}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowProgramDetails(false);
                    setSelectedProgram(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors group"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedProgram.title}
                      </h2>
                      {selectedProgram.tagline && (
                        <p className="text-white/90 text-lg">{selectedProgram.tagline}</p>
                      )}
                    </div>
                    {selectedProgram.scholarshipType && (
                      <div className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full whitespace-nowrap">
                        {selectedProgram.scholarshipType}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-20rem)] p-6 pb-32 space-y-6">
              {/* Description */}
              {(selectedProgram.description || selectedProgram.fullDescription) && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">About This Program</h3>
                  {selectedProgram.fullDescription ? (
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: selectedProgram.fullDescription }}
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProgram.description}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProgram.country && (
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Country</p>
                      <p className="font-semibold text-foreground">{selectedProgram.country}</p>
                    </div>
                  </div>
                )}

                {selectedProgram.university && (
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                    <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">University</p>
                      <p className="font-semibold text-foreground">{selectedProgram.university}</p>
                    </div>
                  </div>
                )}

                {selectedProgram.duration && (
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-semibold text-foreground">{selectedProgram.duration}</p>
                    </div>
                  </div>
                )}

                {selectedProgram.deadline && (
                  <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Application Deadline</p>
                      <p className="font-semibold text-foreground">
                        {new Date(selectedProgram.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fees Section */}
              {(selectedProgram.tuitionFee || selectedProgram.applicationFee) && (
                <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Program Fees</h3>
                  <div className="space-y-3">
                    {selectedProgram.tuitionFee && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tuition Fee:</span>
                        <span className="text-xl font-bold text-foreground">{selectedProgram.tuitionFee}</span>
                      </div>
                    )}
                    {selectedProgram.applicationFee && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Application Fee:</span>
                        <span className="text-xl font-bold text-foreground">{selectedProgram.applicationFee}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Available Slots */}
              {selectedProgram.availableSlots !== null && (
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <Star className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedProgram.availableSlots} slots available
                    </p>
                    <p className="text-sm text-muted-foreground">Limited seats - Apply early!</p>
                  </div>
                </div>
              )}

              {/* Program Features */}
              {selectedProgram.features && Array.isArray(selectedProgram.features) && selectedProgram.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Program Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProgram.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program Requirements */}
              {selectedProgram.programRequirements && selectedProgram.programRequirements.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    Admission Requirements
                  </h3>
                  {selectedProgram.programRequirements.map((req: any, index: number) => (
                    <div key={index} className="space-y-4">
                      {/* Academic Requirements */}
                      {(req.minimumGpa || req.acceptedEducationLevels) && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Academic Requirements</h4>
                          <div className="space-y-2 ml-4">
                            {req.minimumGpa && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">
                                  Minimum GPA: <strong>{req.minimumGpa}</strong> {req.gradingSystem && `(${req.gradingSystem})`}
                                </span>
                              </div>
                            )}
                            {req.acceptedEducationLevels && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">
                                  Education Level: <strong>{Array.isArray(req.acceptedEducationLevels) ? req.acceptedEducationLevels.join(', ') : req.acceptedEducationLevels}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Language Requirements */}
                      {(req.toeflMinimum || req.ieltsMinimum || req.duolingoMinimum || req.pteMinimum) && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Language Proficiency</h4>
                          <div className="space-y-2 ml-4">
                            {req.toeflMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">TOEFL: <strong>{req.toeflMinimum}+</strong></span>
                              </div>
                            )}
                            {req.ieltsMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">IELTS: <strong>{req.ieltsMinimum}+</strong></span>
                              </div>
                            )}
                            {req.duolingoMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">Duolingo: <strong>{req.duolingoMinimum}+</strong></span>
                              </div>
                            )}
                            {req.pteMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">PTE: <strong>{req.pteMinimum}+</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Standardized Test Requirements */}
                      {(req.satMinimum || req.actMinimum || req.greMinimum || req.gmatMinimum) && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Standardized Tests</h4>
                          <div className="space-y-2 ml-4">
                            {req.satMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">SAT: <strong>{req.satMinimum}+</strong></span>
                              </div>
                            )}
                            {req.actMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">ACT: <strong>{req.actMinimum}+</strong></span>
                              </div>
                            )}
                            {req.greMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">GRE: <strong>{req.greMinimum}+</strong></span>
                              </div>
                            )}
                            {req.gmatMinimum && (
                              <div className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">GMAT: <strong>{req.gmatMinimum}+</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {req.workExperienceRequired && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Work Experience</h4>
                          <div className="flex items-start gap-2 ml-4">
                            <span className="text-orange-600 dark:text-orange-400">•</span>
                            <span className="text-sm text-foreground">
                              {req.minimumWorkExperienceYears
                                ? `Minimum ${req.minimumWorkExperienceYears} year${req.minimumWorkExperienceYears > 1 ? 's' : ''} of work experience required`
                                : 'Work experience required'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Required Documents */}
                      {req.requiredDocuments && Array.isArray(req.requiredDocuments) && req.requiredDocuments.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Required Documents</h4>
                          <div className="space-y-2 ml-4">
                            {req.requiredDocuments.map((doc: string, docIndex: number) => (
                              <div key={docIndex} className="flex items-start gap-2">
                                <span className="text-orange-600 dark:text-orange-400">•</span>
                                <span className="text-sm text-foreground">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Requirements */}
                      {req.additionalRequirements && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Additional Requirements</h4>
                          <div className="ml-4 text-sm text-foreground">
                            {req.additionalRequirements}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* JSON Requirements (if programRequirements is not available) */}
              {(!selectedProgram.programRequirements || selectedProgram.programRequirements.length === 0) &&
               selectedProgram.requirements && Array.isArray(selectedProgram.requirements) &&
               selectedProgram.requirements.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">Requirements</h3>
                  <div className="space-y-2">
                    {selectedProgram.requirements.map((req: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Program Benefits */}
              {selectedProgram.benefits && Array.isArray(selectedProgram.benefits) && selectedProgram.benefits.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">What You'll Get</h3>
                  <div className="space-y-3">
                    {selectedProgram.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 p-6 bg-card/95 border-t-2 border-border backdrop-blur-md shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowProgramDetails(false);
                    setSelectedProgram(null);
                  }}
                  className="flex-1 px-6 py-3 bg-background border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all"
                >
                  Close
                </button>
                <button
                  onClick={handleApplyNow}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Consultation Modal for Family Travel, Visa Assistance, and Itinerary */}
      {showConsultationModal && service && (service.slug === 'family-travel' || service.slug === 'visa-assistance' || service.slug === 'itinerary') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowConsultationModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border-2 border-border shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {service.slug === 'family-travel' ? 'Book Family Travel Consultation' : 
                   service.slug === 'visa-assistance' ? 'Request Visa Assistance' : 
                   'Plan Your Itinerary'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill out the form below to get started
                </p>
              </div>
              <button
                onClick={() => setShowConsultationModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {service.slug === 'family-travel' && (
                <ConsultationForm
                  serviceId={service.id}
                  serviceTitle={service.title}
                  onClose={() => setShowConsultationModal(false)}
                />
              )}
              {service.slug === 'visa-assistance' && (
                <VisaAssistanceForm
                  serviceId={service.id}
                  serviceTitle={service.title}
                  onClose={() => setShowConsultationModal(false)}
                />
              )}
              {service.slug === 'itinerary' && (
                <ItineraryPlanningForm
                  serviceId={service.id}
                  serviceTitle={service.title}
                  onClose={() => setShowConsultationModal(false)}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
