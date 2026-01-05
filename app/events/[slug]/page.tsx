'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, Loader2, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Mail, X, User, Phone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  status: string;
  category: string | null;
  price: number | null;
  maxParticipants: number | null;
  currentParticipants: number;
  includes: any;
  requirements: any;
  itinerary: any;
  isFeatured: boolean;
  createdAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    participants: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentOption: 'PAY_LATER' as 'PAY_NOW' | 'PAY_LATER',
  });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = event?.title || '';
  const shareDescription = event?.description?.replace(/<[^>]*>/g, '').substring(0, 100) || '';

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
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        const foundEvent = data.find((e: Event) => e.slug === slug);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.fullName || !bookingData.email || !bookingData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!event) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          participants: bookingData.participants,
          fullName: bookingData.fullName,
          email: bookingData.email,
          phone: bookingData.phone,
          specialRequests: bookingData.specialRequests,
          paymentOption: bookingData.paymentOption,
          totalAmount: event.price ? event.price * bookingData.participants : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to create booking');
        return;
      }

      toast.success('Booking created successfully!');
      setShowBookingModal(false);

      // Reset form
      setBookingData({
        participants: 1,
        fullName: '',
        email: '',
        phone: '',
        specialRequests: '',
        paymentOption: 'PAY_LATER',
      });

      // Redirect based on payment option
      if (bookingData.paymentOption === 'PAY_NOW') {
        toast.info('Redirecting to payment...');
        // TODO: Implement payment gateway redirection
        setTimeout(() => {
          router.push(`/profile/bookings?booking=${data.booking.id}`);
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/profile/bookings');
        }, 1500);
      }

    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = event?.price ? event.price * bookingData.participants : 0;

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

  if (notFound || !event) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
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
        <section className="relative h-[60vh] min-h-[400px]">
          {event.imageUrl && (
            <div className="absolute inset-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}
          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Events
              </Link>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {event.category && (
                  <span className="inline-block px-4 py-1 bg-primary text-white rounded-full text-sm font-semibold mb-4">
                    {event.category}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white flex-1">
                    {event.title}
                  </h1>
                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
                    >
                      <Share2 className="w-6 h-6 text-white" />
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
                <div className="flex flex-wrap gap-4 text-white/90">
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(event.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  )}
                  {event.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                    </div>
                  )}
                  {event.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{event.duration}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                {event.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-card rounded-xl p-8 border border-border"
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                    <div
                      className="prose prose-lg max-w-none text-muted-foreground prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </motion.div>
                )}

                {/* What's Included */}
                {event.includes && Array.isArray(event.includes) && event.includes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-card rounded-xl p-8 border border-border"
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-4">What's Included</h2>
                    <ul className="space-y-3">
                      {event.includes.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Requirements */}
                {event.requirements && Array.isArray(event.requirements) && event.requirements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-card rounded-xl p-8 border border-border"
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {event.requirements.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Location Map */}
                {event.location && event.locationLat && event.locationLng && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-card rounded-xl p-8 border border-border"
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-4">Location</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <p className="text-muted-foreground">{event.location}</p>
                      </div>
                      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps?q=${event.locationLat},${event.locationLng}&hl=es&z=14&output=embed`}
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${event.locationLat},${event.locationLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Get Directions
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-card rounded-xl p-6 border border-border sticky top-24 space-y-6"
                >
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      event.status === 'UPCOMING' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      event.status === 'ONGOING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      event.status === 'ENDED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Price */}
                  {event.price && (
                    <div className="text-center py-4 border-b border-border">
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold text-foreground">
                        <DollarSign className="w-8 h-8" />
                        {event.price}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">per person</p>
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="space-y-4">
                    {event.maxParticipants && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-5 h-5" />
                          <span>Participants</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      </div>
                    )}

                    {event.startDate && event.endDate && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-foreground">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-sm">
                            to {new Date(event.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Book Now Button */}
                  {(event.status === 'UPCOMING' || event.status === 'ONGOING') && (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Book Now
                    </button>
                  )}

                  {event.status === 'ENDED' && (
                    <div className="text-center text-muted-foreground text-sm">
                      This event has ended
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Book {event?.title}</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
                  {/* Participants */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Number of Participants *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={event?.maxParticipants ? event.maxParticipants - event.currentParticipants : 100}
                      value={bookingData.participants}
                      onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    {event?.price && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Total: ${totalPrice.toFixed(2)} ({bookingData.participants} × ${event.price})
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={bookingData.fullName}
                        onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Special Requests (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        rows={4}
                        className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder="Any dietary restrictions, accessibility needs, etc."
                      />
                    </div>
                  </div>

                  {/* Payment Option */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Payment Option *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, paymentOption: 'PAY_NOW' })}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          bookingData.paymentOption === 'PAY_NOW'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <DollarSign className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Pay Now</div>
                        <div className="text-xs text-muted-foreground mt-1">Secure payment</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, paymentOption: 'PAY_LATER' })}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          bookingData.paymentOption === 'PAY_LATER'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Clock className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">Pay Later</div>
                        <div className="text-xs text-muted-foreground mt-1">Reserve now</div>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {bookingData.paymentOption === 'PAY_NOW' ? 'Proceed to Payment' : 'Confirm Booking'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
