'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, Phone, MessageSquare, Plus, Loader2, CheckCircle, XCircle, AlertCircle, Trash2, Eye, FileText, Plane, BookOpen, DollarSign, CreditCard, Edit, X, MapPin, Building2, GraduationCap, Star, ArrowRight, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLoader from '@/app/components/PageLoader';
import ConsultationForm from '@/app/components/ConsultationForm';
import VisaAssistanceForm from '@/app/components/VisaAssistanceForm';
import ItineraryPlanningForm from '@/app/components/ItineraryPlanningForm';

interface Service {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  price: number | null;
  maxParticipants: number | null;
  currentParticipants: number;
  status: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  country: string | null;
  university: string | null;
  duration: string | null;
  tuitionFee: string | null;
  scholarshipType: string | null;
  availableSlots: number | null;
}

interface Booking {
  id: string;
  eventId?: string | null;
  bookingType: string;
  status: string;
  participants: number;
  paymentStatus: string;
  specialRequests: string | null;
  bookingDate: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  totalAmount: number | null;
  service: Service | null;
  event: Event | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

interface Application {
  id: string;
  programName: string;
  programCountry: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

interface Reservation {
  id: string;
  reservationType: string;
  status: string;
  departureCity: string | null;
  arrivalCity: string | null;
  hotelCity: string | null;
  departureDate: string | null;
  checkInDate: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface ConsultationBooking {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  travelers: any;
  travelerCount: number;
  feeEstimate: number;
  travelStartDate: string;
  travelEndDate: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt: string | null;
  service: Service;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface VisaAssistanceBooking {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  destinationCountry: string;
  travelPurpose: string;
  applicantCount: number;
  feeEstimate: number | null;
  finalFee: number | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt: string | null;
  service: Service;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface ItineraryBooking {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  travelerCount: number;
  feeEstimate: number | null;
  finalFee: number | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt: string | null;
  service: Service;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

type TabType = 'bookings' | 'applications' | 'reservations' | 'consultations';

export default function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>([]);
  const [visaBookings, setVisaBookings] = useState<VisaAssistanceBooking[]>([]);
  const [itineraryBookings, setItineraryBookings] = useState<ItineraryBooking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedVisaBooking, setSelectedVisaBooking] = useState<VisaAssistanceBooking | null>(null);
  const [selectedItineraryBooking, setSelectedItineraryBooking] = useState<ItineraryBooking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'booking' | 'application' | 'reservation'; title: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState({
    participants: 1,
    specialRequests: '',
  });
  const [formData, setFormData] = useState({
    serviceId: '',
    bookingType: 'SERVICE',
    participants: 1,
    specialRequests: '',
    preferredDate: '',
    preferredTime: '',
  });

  useEffect(() => {
    checkAdminStatus();
    fetchBookings();
    fetchServices();
    fetchConsultations(); // Fetch consultations for all users
    fetchVisaBookings(); // Fetch visa bookings for all users
    fetchItineraryBookings(); // Fetch itinerary bookings for all users
    fetchEvents(); // Fetch events for tours booking
    fetchPrograms(); // Fetch programs for study programs

    // Check for tab query parameter
    const tab = searchParams.get('tab');
    if (tab && (tab === 'bookings' || tab === 'applications' || tab === 'reservations' || tab === 'consultations')) {
      setActiveTab(tab as TabType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Only fetch applications and reservations if admin
    if (isAdmin) {
      fetchApplications();
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?active=true');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/consultation-bookings');
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchVisaBookings = async () => {
    try {
      const response = await fetch('/api/visa-assistance-bookings');
      if (response.ok) {
        const data = await response.json();
        setVisaBookings(data);
      }
    } catch (error) {
      console.error('Error fetching visa bookings:', error);
    }
  };

  const fetchItineraryBookings = async () => {
    try {
      const response = await fetch('/api/itinerary-bookings');
      if (response.ok) {
        const data = await response.json();
        setItineraryBookings(data);
      }
    } catch (error) {
      console.error('Error fetching itinerary bookings:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        // Filter only upcoming and ongoing events
        const activeEvents = data.filter((e: any) => e.status === 'UPCOMING' || e.status === 'ONGOING');
        setEvents(activeEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs?active=true');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleSubmitBooking = async () => {
    if (!formData.serviceId) {
      toast.error('Please select a service');
      return;
    }

    if (!formData.preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }

    if (!formData.preferredTime) {
      toast.error('Please select a preferred time');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Booking request submitted successfully!');
        setShowNewBookingModal(false);
        setFormData({
          serviceId: '',
          bookingType: 'SERVICE',
          participants: 1,
          specialRequests: '',
          preferredDate: '',
          preferredTime: '',
        });
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id: string, type: 'booking' | 'application' | 'reservation', title: string) => {
    setDeleteTarget({ id, type, title });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      let response;
      let successMessage = '';
      let errorMessage = '';

      switch (deleteTarget.type) {
        case 'booking':
          response = await fetch(`/api/bookings?id=${deleteTarget.id}`, {
            method: 'DELETE',
          });
          successMessage = 'Booking cancelled successfully';
          errorMessage = 'Failed to cancel booking';
          break;

        case 'application':
          response = await fetch(`/api/applications/${deleteTarget.id}`, {
            method: 'DELETE',
          });
          successMessage = 'Application deleted successfully';
          errorMessage = 'Failed to delete application';
          break;

        case 'reservation':
          response = await fetch(`/api/reservations?id=${deleteTarget.id}`, {
            method: 'DELETE',
          });
          successMessage = 'Reservation cancelled successfully';
          errorMessage = 'Failed to cancel reservation';
          break;
      }

      if (response && response.ok) {
        toast.success(successMessage);

        // Refresh the appropriate list
        if (deleteTarget.type === 'booking') {
          fetchBookings();
        } else if (deleteTarget.type === 'application') {
          fetchApplications();
        } else if (deleteTarget.type === 'reservation') {
          fetchReservations();
        }
      } else {
        const data = await response?.json();
        toast.error(data?.error || errorMessage);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('An error occurred while deleting');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handlePayNow = async (booking: Booking) => {
    toast.info('Redirecting to payment...');
    // Redirect to payment page - amount will be fetched securely from database
    router.push(`/payment?bookingId=${booking.id}`);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditFormData({
      participants: booking.participants,
      specialRequests: booking.specialRequests || '',
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
    if (!editingBooking) return;

    // Get base price from event
    const basePrice = editingBooking.event?.price || 0;

    if (editFormData.participants < 1) {
      toast.error('Participants must be at least 1');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBooking.id,
          participants: editFormData.participants,
          specialRequests: editFormData.specialRequests,
          baseAmount: basePrice,
        }),
      });

      if (response.ok) {
        toast.success('Booking updated successfully!');
        setShowEditModal(false);
        setEditingBooking(null);
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEditTotal = () => {
    if (!editingBooking?.event?.price) return { base: 0, fee: 0, total: 0 };

    const base = Number(editingBooking.event.price) * editFormData.participants;
    const fee = base * 0.02; // 2% service fee
    const total = base + fee;

    return { base, fee, total };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Payment Pending
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const totalCount = bookings.length + applications.length + reservations.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-purple-600 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {isAdmin ? 'Dashboard Overview' : 'My Travel Hub'}
            </h1>
            <p className="text-blue-100 max-w-xl text-lg">
              {isAdmin
                ? `Manage bookings, track applications, and oversee reservations. Total records: ${totalCount}`
                : 'Manage your upcoming adventures, track visa applications, and view your travel history.'}
            </p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'applications') {
                router.push('/profile/applications/new');
              } else if (activeTab === 'reservations') {
                router.push('/profile/reservations');
              } else {
                setShowNewBookingModal(true);
              }
            }}
            className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 font-semibold text-primary transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              {activeTab === 'applications' ? 'New Application' :
                activeTab === 'reservations' ? 'New Reservation' :
                  'Start New Booking'}
            </span>
          </button>
        </div>

        {/* Quick Stats Row (Optional, fits nicely in header) */}
        {!loading && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold">{bookings.length}</div>
              <div className="text-sm text-blue-100">Service Bookings</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold">{applications.length}</div>
              <div className="text-sm text-blue-100">Applications</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold">{reservations.length}</div>
              <div className="text-sm text-blue-100">Reservations</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold">{consultations.length + visaBookings.length + itineraryBookings.length}</div>
              <div className="text-sm text-blue-100">Consultations</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      {isAdmin ? (
        <div className="bg-background/50 backdrop-blur-md sticky top-4 z-30 p-1.5 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {[
              { id: 'bookings', icon: BookOpen, label: 'Service Bookings', count: bookings.length },
              { id: 'applications', icon: FileText, label: 'Applications', count: applications.length },
              { id: 'reservations', icon: Plane, label: 'Reservations', count: reservations.length },
              { id: 'consultations', icon: Users, label: 'Consultations', count: consultations.length + visaBookings.length + itineraryBookings.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 relative px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group ${activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-border -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* User Tabs - Replacing the stacked view with tabs for users too for better UX */
        <div className="bg-background/50 backdrop-blur-md sticky top-4 z-30 p-1.5 rounded-2xl border border-border shadow-sm mb-6">
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-4 gap-2 no-scrollbar">
            {[
              { id: 'consultations', icon: Users, label: 'Consultations', count: consultations.length + visaBookings.length + itineraryBookings.length },
              { id: 'reservations', icon: Plane, label: 'Reservations', count: reservations.length },
              { id: 'applications', icon: FileText, label: 'Applications', count: applications.length },
              { id: 'bookings', icon: BookOpen, label: 'Events/Other', count: bookings.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-shrink-0 sm:flex-1 relative px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="userActiveTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-border -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {loading ? (
        <PageLoader text="Loading bookings..." />
      ) : !isAdmin ? (
        // Normal user view - show all bookings including consultations
        <div className="space-y-8">
          {/* Consultations */}
          {consultations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">My Consultations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{consultation.service.title}</h3>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${consultation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {consultation.paymentStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(consultation.travelStartDate).toLocaleDateString()} - {new Date(consultation.travelEndDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{consultation.travelerCount} Traveler(s)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-border">
                      <div className="text-2xl font-bold text-primary">GHS {Number(consultation.feeEstimate).toFixed(2)}</div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => router.push(`/profile/consultations/${consultation.id}`)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {consultation.paymentStatus === 'PENDING' ? (
                          <button
                            onClick={() => router.push(`/payment?consultationId=${consultation.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-lg"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        ) : consultation.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => router.push(`/profile/consultations/${consultation.id}/edit`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visa Assistance Bookings */}
          {visaBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">My Visa Assistance Requests</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visaBookings.map((visa) => (
                  <div key={visa.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Plane className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-foreground">Visa Assistance</h3>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${visa.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {visa.paymentStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{visa.destinationCountry}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{visa.travelPurpose}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{visa.applicantCount} Applicant(s)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-border">
                      <div className="text-2xl font-bold text-primary">
                        GHS {Number(visa.finalFee || visa.feeEstimate || 0).toFixed(2)}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setSelectedVisaBooking(visa)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {visa.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => router.push(`/payment?visaAssistanceId=${visa.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-lg"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Planning Bookings */}
          {itineraryBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">My Itinerary Planning Requests</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {itineraryBookings.map((itinerary) => (
                  <div key={itinerary.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-foreground">Itinerary Planning</h3>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${itinerary.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {itinerary.paymentStatus}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{itinerary.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(itinerary.travelStartDate).toLocaleDateString()} - {new Date(itinerary.travelEndDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{itinerary.travelerCount} Traveler(s)</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-border">
                      <div className="text-2xl font-bold text-primary">
                        GHS {Number(itinerary.finalFee || itinerary.feeEstimate || 0).toFixed(2)}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setSelectedItineraryBooking(itinerary)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {itinerary.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => router.push(`/payment?itineraryId=${itinerary.id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm font-medium shadow-lg"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Bookings */}
          {bookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">My Bookings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border-2 border-border overflow-hidden hover:border-primary/50 transition-all"
                  >
                    {/* Service/Event Image */}
                    {(booking.service?.imageUrl || booking.event?.imageUrl) && (
                      <div className="h-48 relative overflow-hidden">
                        <img
                          src={booking.service?.imageUrl || booking.event?.imageUrl || ''}
                          alt={booking.service?.title || booking.event?.title || ''}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {getStatusBadge(booking.status)}
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {booking.service?.title || booking.event?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.bookingType} Appointment
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            Requested on {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>

                        {booking.participants > 1 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4 text-primary" />
                            <span>{booking.participants} participant(s)</span>
                          </div>
                        )}

                        {booking.specialRequests && (() => {
                          try {
                            const requests = JSON.parse(booking.specialRequests);
                            return (
                              <>
                                {requests.preferredDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span>Preferred: {new Date(requests.preferredDate).toLocaleDateString()}</span>
                                    {requests.preferredTime && <span>at {requests.preferredTime}</span>}
                                  </div>
                                )}
                                {requests.message && (
                                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{requests.message}</span>
                                  </div>
                                )}
                              </>
                            );
                          } catch {
                            return (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{booking.specialRequests}</span>
                              </div>
                            );
                          }
                        })()}

                        {booking.confirmedAt && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Confirmed on {new Date(booking.confirmedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Price Breakdown */}
                        {booking.totalAmount && (() => {
                          try {
                            const requests = JSON.parse(booking.specialRequests || '{}');
                            if (requests.baseAmount && requests.serviceFee) {
                              return (
                                <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 mt-2">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Base amount</span>
                                    <span>GH₵ {Number(requests.baseAmount).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Service fee (2%)</span>
                                    <span>GH₵ {Number(requests.serviceFee).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-semibold text-foreground pt-1.5 border-t border-border">
                                    <span>Total</span>
                                    <span className="text-primary">GH₵ {Number(booking.totalAmount).toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            // Fallback to simple display
                          }
                          return (
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span>Total: GH₵ {Number(booking.totalAmount).toFixed(2)}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 px-4 py-2.5 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          <span>View Details</span>
                        </button>

                        {/* Edit Button - Only show for user's own event bookings that are not cancelled or completed */}
                        {booking.event && booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Edit className="w-4 h-4 flex-shrink-0" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* Pay Now Button - Only show for user's own bookings with pending payment */}
                        {booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handlePayNow(booking)}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                          >
                            <CreditCard className="w-4 h-4 flex-shrink-0" />
                            <span>Pay Now</span>
                          </button>
                        )}

                        {/* Cancel Button - Only show for regular users (not admins) */}
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => openDeleteModal(
                              booking.id,
                              'booking',
                              booking.service?.title || booking.event?.title || 'this booking'
                            )}
                            className="w-full sm:w-auto px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Trash2 className="w-4 h-4 flex-shrink-0" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {consultations.length === 0 && visaBookings.length === 0 && itineraryBookings.length === 0 && bookings.length === 0 && (
            <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start by booking a consultation or requesting an appointment</p>
              <button onClick={() => router.push('/services/family-travel')} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Book Consultation
              </button>
            </div>
          )}
        </div>
      ) : activeTab === 'bookings' ? (
        bookings.length === 0 ? (
          <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by requesting an appointment with one of our services
            </p>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Request Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border-2 border-border overflow-hidden hover:border-primary/50 transition-all"
              >
                {/* Service/Event Image */}
                {(booking.service?.imageUrl || booking.event?.imageUrl) && (
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={booking.service?.imageUrl || booking.event?.imageUrl || ''}
                      alt={booking.service?.title || booking.event?.title || ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {booking.service?.title || booking.event?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.bookingType} Appointment
                    </p>
                    {isAdmin && booking.user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Client: {booking.user.firstName} {booking.user.lastName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {isAdmin && booking.user && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4 text-primary" />
                          <span>{booking.user.email}</span>
                        </div>
                        {booking.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 text-primary" />
                            <span>{booking.user.phone}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        Requested on {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                    </div>

                    {booking.participants > 1 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4 text-primary" />
                        <span>{booking.participants} participant(s)</span>
                      </div>
                    )}

                    {booking.specialRequests && (() => {
                      try {
                        const requests = JSON.parse(booking.specialRequests);
                        return (
                          <>
                            {requests.preferredDate && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>Preferred: {new Date(requests.preferredDate).toLocaleDateString()}</span>
                                {requests.preferredTime && <span>at {requests.preferredTime}</span>}
                              </div>
                            )}
                            {requests.message && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{requests.message}</span>
                              </div>
                            )}
                          </>
                        );
                      } catch {
                        return (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{booking.specialRequests}</span>
                          </div>
                        );
                      }
                    })()}

                    {booking.confirmedAt && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Confirmed on {new Date(booking.confirmedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {booking.totalAmount && (() => {
                      try {
                        const requests = JSON.parse(booking.specialRequests || '{}');
                        if (requests.baseAmount && requests.serviceFee) {
                          return (
                            <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 mt-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Base amount</span>
                                <span>GH₵ {Number(requests.baseAmount).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Service fee (2%)</span>
                                <span>GH₵ {Number(requests.serviceFee).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-semibold text-foreground pt-1.5 border-t border-border">
                                <span>Total</span>
                                <span className="text-primary">GH₵ {Number(booking.totalAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // Fallback to simple display
                      }
                      return (
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span>Total: GH₵ {Number(booking.totalAmount).toFixed(2)}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-1 px-4 py-2.5 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span>View Details</span>
                    </button>

                    {/* Edit Button - Only show for user's own event bookings that are not cancelled or completed */}
                    {!isAdmin && booking.event && booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleEditBooking(booking)}
                        className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4 flex-shrink-0" />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Pay Now Button - Only show for user's own bookings with pending payment */}
                    {!isAdmin && booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handlePayNow(booking)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                      >
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span>Pay Now</span>
                      </button>
                    )}

                    {/* Cancel Button - Only show for regular users (not admins) */}
                    {!isAdmin && booking.status === 'PENDING' && (
                      <button
                        onClick={() => openDeleteModal(
                          booking.id,
                          'booking',
                          booking.service?.title || booking.event?.title || 'this booking'
                        )}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : activeTab === 'applications' ? (
        applications.length === 0 ? (
          <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">
              Apply for study programs and educational opportunities
            </p>
            <button
              onClick={() => router.push('/profile/applications/new')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Application
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/profile/applications/${application.id}`)}
                className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {application.programName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{application.programCountry}</p>
                      {isAdmin && application.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Client: {application.user.firstName} {application.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  {isAdmin && application.user && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4 text-primary" />
                        <span>{application.user.email}</span>
                      </div>
                      {application.user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{application.user.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                  {application.submittedAt && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    View Application
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : activeTab === 'reservations' ? (
        reservations.length === 0 ? (
          <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
            <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No reservations yet</h3>
            <p className="text-muted-foreground mb-6">
              Book your flights and hotels with us
            </p>
            <button
              onClick={() => router.push('/profile/reservations')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Make Reservation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push('/profile/reservations')}
                className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Plane className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {reservation.reservationType === 'FLIGHT' && 'Flight Reservation'}
                        {reservation.reservationType === 'HOTEL' && 'Hotel Reservation'}
                        {reservation.reservationType === 'BOTH' && 'Flight & Hotel Package'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {reservation.reservationType === 'FLIGHT' && reservation.departureCity && reservation.arrivalCity &&
                          `${reservation.departureCity} → ${reservation.arrivalCity}`}
                        {reservation.reservationType === 'HOTEL' && reservation.hotelCity &&
                          `Hotel in ${reservation.hotelCity}`}
                        {reservation.reservationType === 'BOTH' &&
                          `Trip to ${reservation.arrivalCity || reservation.hotelCity}`}
                      </p>
                      {isAdmin && reservation.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Client: {reservation.user.firstName} {reservation.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  {isAdmin && reservation.user && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4 text-primary" />
                      <span>{reservation.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {reservation.departureDate && `Departure: ${new Date(reservation.departureDate).toLocaleDateString()}`}
                      {reservation.checkInDate && `Check-in: ${new Date(reservation.checkInDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Requested: {new Date(reservation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    View Reservation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : activeTab === 'consultations' ? (
        consultations.length === 0 && visaBookings.length === 0 && itineraryBookings.length === 0 ? (
          <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No consultations yet</h3>
            <p className="text-muted-foreground mb-6">
              No consultation requests have been made yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Family Travel Consultations */}
            {consultations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Family Travel Consultations ({consultations.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {consultations.map((consultation) => (
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-semibold text-foreground">{consultation.contactFullName}</h4>
                            <p className="text-sm text-muted-foreground">{consultation.contactEmail}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${consultation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {consultation.paymentStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(consultation.travelStartDate).toLocaleDateString()} - {new Date(consultation.travelEndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{consultation.travelerCount} Travelers</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span>GHS {Number(consultation.feeEstimate).toFixed(2)}</span>
                        </div>
                      </div>
                      {consultation.confirmedAt && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-3 pt-3 border-t border-border">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed on {new Date(consultation.confirmedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Visa Assistance Bookings */}
            {visaBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-purple-600" />
                  Visa Assistance Requests ({visaBookings.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {visaBookings.map((visa) => (
                    <motion.div
                      key={visa.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border-2 border-border p-6 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Plane className="w-6 h-6 text-purple-600" />
                          <div>
                            <h4 className="font-semibold text-foreground">{visa.contactFullName}</h4>
                            <p className="text-sm text-muted-foreground">{visa.contactEmail}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${visa.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {visa.paymentStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{visa.destinationCountry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{visa.travelPurpose}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{visa.applicantCount} Applicants</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span>GHS {Number(visa.finalFee || visa.feeEstimate || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <button
                          onClick={() => router.push(`/profile/visa-assistance`)}
                          className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          View Details
                        </button>
                      </div>
                      {visa.confirmedAt && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-3 pt-3 border-t border-border">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed on {new Date(visa.confirmedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Planning Bookings */}
            {itineraryBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Itinerary Planning Requests ({itineraryBookings.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {itineraryBookings.map((itinerary) => (
                    <motion.div
                      key={itinerary.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl border-2 border-border p-6 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-6 h-6 text-orange-600" />
                          <div>
                            <h4 className="font-semibold text-foreground">{itinerary.contactFullName}</h4>
                            <p className="text-sm text-muted-foreground">{itinerary.contactEmail}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${itinerary.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {itinerary.paymentStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{itinerary.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(itinerary.travelStartDate).toLocaleDateString()} - {new Date(itinerary.travelEndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{itinerary.travelerCount} Travelers</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span>GHS {Number(itinerary.finalFee || itinerary.feeEstimate || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <button
                          onClick={() => router.push(`/profile/itinerary-planning`)}
                          className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          View Details
                        </button>
                      </div>
                      {itinerary.confirmedAt && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mt-3 pt-3 border-t border-border">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed on {new Date(itinerary.confirmedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : null}


      {/* New Booking Modal */}
      <AnimatePresence>
        {showNewBookingModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowNewBookingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full ${services.find(s => s.id === formData.serviceId)?.slug === 'family-travel'
                ? 'sm:max-w-5xl'
                : (services.find(s => s.id === formData.serviceId)?.slug === 'tours' || services.find(s => s.id === formData.serviceId)?.slug === 'study-programs')
                  ? 'sm:max-w-4xl'
                  : 'sm:max-w-2xl'
                } bg-card rounded-2xl border-2 border-border z-50 overflow-hidden flex flex-col max-h-[90vh]`}
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">
                  {services.find(s => s.id === formData.serviceId)?.slug === 'family-travel'
                    ? 'Family Travel Consultation'
                    : services.find(s => s.id === formData.serviceId)?.slug === 'tours'
                      ? 'International & Domestic Tours - Select Event'
                      : services.find(s => s.id === formData.serviceId)?.slug === 'study-programs'
                        ? 'Study & Summer Programs - Select Program'
                        : 'Request Appointment'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {services.find(s => s.id === formData.serviceId)?.slug === 'family-travel'
                    ? 'Fill out the consultation form below'
                    : 'Book an appointment with us for consultation'}
                </p>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Select Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => {
                      const selectedServiceId = e.target.value;
                      const selectedService = services.find(s => s.id === selectedServiceId);

                      // Check if the selected service is Hotel & Flight Reservations
                      if (selectedService && (selectedService.slug === 'reservations' || selectedService.title === 'Hotel & Flight Reservations')) {
                        // Close modal and redirect to reservations page
                        setShowNewBookingModal(false);
                        toast.info('Redirecting to flight & hotel reservations...');
                        router.push('/services/reservations');
                      } else {
                        setFormData({ ...formData, serviceId: selectedServiceId });
                      }
                    }}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">-- Select a service --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show Custom Forms based on service type */}
                {services.find(s => s.id === formData.serviceId)?.slug === 'family-travel' ? (
                  <ConsultationForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({
                        serviceId: '',
                        bookingType: 'SERVICE',
                        participants: 1,
                        specialRequests: '',
                        preferredDate: '',
                        preferredTime: '',
                      });
                      fetchConsultations();
                    }}
                  />
                ) : services.find(s => s.id === formData.serviceId)?.slug === 'visa-assistance' ? (
                  <VisaAssistanceForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({
                        serviceId: '',
                        bookingType: 'SERVICE',
                        participants: 1,
                        specialRequests: '',
                        preferredDate: '',
                        preferredTime: '',
                      });
                    }}
                  />
                ) : services.find(s => s.id === formData.serviceId)?.slug === 'itinerary' ? (
                  <ItineraryPlanningForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({
                        serviceId: '',
                        bookingType: 'SERVICE',
                        participants: 1,
                        specialRequests: '',
                        preferredDate: '',
                        preferredTime: '',
                      });
                    }}
                  />
                ) : services.find(s => s.id === formData.serviceId)?.slug === 'tours' ? (
                  /* Show available events for tours service */
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select an event to book for International & Domestic Tours
                    </p>
                    {events.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No events available at the moment</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => {
                              setShowNewBookingModal(false);
                              router.push(`/events/${event.slug}`);
                            }}
                            className="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-all border-2 border-transparent hover:border-primary hover:shadow-lg group"
                          >
                            {event.imageUrl && (
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-full h-32 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform"
                              />
                            )}
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{event.title}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {event.startDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {event.price && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span>GH₵ {Number(event.price).toFixed(2)} per person</span>
                                </div>
                              )}
                              {event.maxParticipants && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{event.currentParticipants}/{event.maxParticipants} spots</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : services.find(s => s.id === formData.serviceId)?.slug === 'study-programs' ? (
                  /* Show available programs for study programs service */
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a program to explore study abroad opportunities
                    </p>
                    {programs.length === 0 ? (
                      <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No programs available at the moment</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {programs.map((program) => (
                          <div
                            key={program.id}
                            onClick={() => {
                              setShowNewBookingModal(false);
                              router.push(`/programs/${program.slug}`);
                            }}
                            className="bg-gradient-to-br from-card to-muted/20 rounded-xl p-5 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary group relative overflow-hidden"
                          >
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Program Image */}
                            {program.imageUrl && (
                              <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl">
                                <img
                                  src={program.imageUrl}
                                  alt={program.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Scholarship Badge */}
                                {program.scholarshipType && (
                                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-white" />
                                    {program.scholarshipType}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="relative space-y-3">
                              {/* Program Title */}
                              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-lg leading-tight">
                                {program.title}
                              </h3>

                              {/* Program Details */}
                              <div className="space-y-2">
                                {program.country && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="line-clamp-1 font-medium">{program.country}</span>
                                  </div>
                                )}
                                {program.university && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="line-clamp-1">{program.university}</span>
                                  </div>
                                )}
                                {program.duration && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>{program.duration}</span>
                                  </div>
                                )}
                              </div>

                              {/* Tuition Fee */}
                              {program.tuitionFee && (
                                <div className="pt-3 border-t border-border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Tuition Fee:</span>
                                    <span className="font-semibold text-primary">{program.tuitionFee}</span>
                                  </div>
                                </div>
                              )}

                              {/* Available Slots */}
                              {program.availableSlots !== null && program.availableSlots > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                    {program.availableSlots} spots available
                                  </span>
                                </div>
                              )}

                              {/* View Details Button */}
                              <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg font-medium transition-all duration-300 group-hover:shadow-lg">
                                <span className="text-sm">View Program</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Preferred Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredDate: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Preferred Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={formData.preferredTime}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredTime: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Number of Participants
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.participants}
                        onChange={(e) =>
                          setFormData({ ...formData, participants: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Special Requests or Notes
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) =>
                          setFormData({ ...formData, specialRequests: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder="Any specific requirements or questions..."
                      />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> This is a booking request. Our team will review and confirm your appointment via email or phone.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Only show action buttons for non-consultation, non-tours, and non-study-programs bookings */}
              {services.find(s => s.id === formData.serviceId)?.slug !== 'family-travel' && services.find(s => s.id === formData.serviceId)?.slug !== 'tours' && services.find(s => s.id === formData.serviceId)?.slug !== 'study-programs' && (
                <div className="p-6 border-t border-border flex gap-3">
                  <button
                    onClick={() => setShowNewBookingModal(false)}
                    className="flex-1 px-6 py-3 bg-background border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBooking}
                    disabled={submitting || !formData.serviceId || !formData.preferredDate || !formData.preferredTime}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-card rounded-2xl border-2 border-border z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Booking Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedBooking.service?.title || selectedBooking.event?.title}
                    </p>
                  </div>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Booking Type</p>
                    <p className="font-semibold text-foreground">{selectedBooking.bookingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Participants</p>
                    <p className="font-semibold text-foreground">{selectedBooking.participants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                    <p className="font-semibold text-foreground capitalize">{selectedBooking.paymentStatus.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Request Date</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedBooking.specialRequests && (() => {
                  try {
                    const requests = JSON.parse(selectedBooking.specialRequests);
                    return (
                      <>
                        {(requests.preferredDate || requests.preferredTime) && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Preferred Date & Time</p>
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <p className="text-foreground font-semibold">
                                  {requests.preferredDate && new Date(requests.preferredDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                  {requests.preferredTime && ` at ${requests.preferredTime}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {requests.message && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Special Requests</p>
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <p className="text-foreground">{requests.message}</p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  } catch {
                    return (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Special Requests</p>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-foreground">{selectedBooking.specialRequests}</p>
                        </div>
                      </div>
                    );
                  }
                })()}

                {selectedBooking.confirmedAt && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong>Confirmed:</strong> {new Date(selectedBooking.confirmedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedBooking.cancelledAt && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      <strong>Cancelled:</strong> {new Date(selectedBooking.cancelledAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Booking Modal */}
      <AnimatePresence>
        {showEditModal && editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Edit Booking</h2>
                  <p className="text-sm text-muted-foreground mt-1">{editingBooking.event?.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Participants */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Number of Participants *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editingBooking.event?.maxParticipants ? editingBooking.event.maxParticipants - (editingBooking.event.currentParticipants - editingBooking.participants) : 100}
                    value={editFormData.participants}
                    onChange={(e) => setEditFormData({ ...editFormData, participants: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Available slots: {editingBooking.event?.maxParticipants ? editingBooking.event.maxParticipants - (editingBooking.event.currentParticipants - editingBooking.participants) : 'Unlimited'}
                  </p>
                </div>

                {/* Price Breakdown */}
                {editingBooking.event?.price && (
                  <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                    <h3 className="font-semibold text-foreground mb-3">Price Breakdown</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base price per person</span>
                      <span className="font-medium text-foreground">GH₵ {Number(editingBooking.event.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Participants</span>
                      <span className="font-medium text-foreground">× {editFormData.participants}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">GH₵ {calculateEditTotal().base.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service fee (2%)</span>
                      <span className="font-medium text-foreground">GH₵ {calculateEditTotal().fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">GH₵ {calculateEditTotal().total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Special Requests (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                    <textarea
                      value={(() => {
                        try {
                          const parsed = JSON.parse(editFormData.specialRequests);
                          return parsed.message || '';
                        } catch {
                          return editFormData.specialRequests || '';
                        }
                      })()}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(editFormData.specialRequests);
                          parsed.message = e.target.value;
                          setEditFormData({ ...editFormData, specialRequests: JSON.stringify(parsed) });
                        } catch {
                          setEditFormData({ ...editFormData, specialRequests: JSON.stringify({ message: e.target.value }) });
                        }
                      }}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="Any special requirements, dietary restrictions, etc."
                    />
                  </div>
                </div>

                {/* Warning */}
                {editFormData.participants !== editingBooking.participants && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-semibold mb-1">Participant change detected</p>
                        <p>Changing the number of participants will update the total amount. You may need to make an additional payment or receive a partial refund.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-border rounded-xl font-semibold text-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitEdit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Booking
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-2xl max-w-md w-full border-2 border-border overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-red-500/10 border-b border-red-500/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Confirm Deletion</h2>
                    <p className="text-sm text-muted-foreground mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-foreground mb-2">
                  Are you sure you want to {deleteTarget.type === 'booking' ? 'cancel' : 'delete'}{' '}
                  <span className="font-semibold">"{deleteTarget.title}"</span>?
                </p>
                <p className="text-sm text-muted-foreground">
                  {deleteTarget.type === 'booking' && 'This will cancel your booking request.'}
                  {deleteTarget.type === 'application' && 'This will permanently delete your application.'}
                  {deleteTarget.type === 'reservation' && 'This will cancel your reservation.'}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-background border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteTarget.type === 'booking' ? 'Cancel Booking' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visa Assistance Detail Modal */}
      {selectedVisaBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVisaBooking(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border-2 border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plane className="w-8 h-8 text-purple-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Visa Assistance Request</h2>
                    <p className="text-sm text-muted-foreground">Request ID: {selectedVisaBooking.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVisaBooking(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedVisaBooking.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {selectedVisaBooking.paymentStatus}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedVisaBooking.status === 'CONFIRMED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                    {selectedVisaBooking.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.contactFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.contactPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Visa Details */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Visa Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Destination Country</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.destinationCountry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Purpose</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.travelPurpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Applicants</p>
                      <p className="font-medium text-foreground">{selectedVisaBooking.applicantCount}</p>
                    </div>
                  </div>
                </div>

                {/* Fee */}
                <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Consultation Fee:</span>
                    <span className="text-3xl font-bold text-primary">
                      GHS {Number(selectedVisaBooking.finalFee || selectedVisaBooking.feeEstimate || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-sm text-muted-foreground">
                  <p>Requested on: {new Date(selectedVisaBooking.createdAt).toLocaleString()}</p>
                  {selectedVisaBooking.confirmedAt && (
                    <p className="text-green-600 dark:text-green-400">
                      Confirmed on: {new Date(selectedVisaBooking.confirmedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                {selectedVisaBooking.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => {
                      setSelectedVisaBooking(null);
                      router.push(`/payment?visaAssistanceId=${selectedVisaBooking.id}`);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => setSelectedVisaBooking(null)}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Itinerary Detail Modal */}
      {selectedItineraryBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItineraryBooking(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border-2 border-border shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-orange-600/10 to-pink-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-orange-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Itinerary Planning Request</h2>
                    <p className="text-sm text-muted-foreground">Request ID: {selectedItineraryBooking.id.slice(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItineraryBooking(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedItineraryBooking.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {selectedItineraryBooking.paymentStatus}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedItineraryBooking.status === 'CONFIRMED'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                    {selectedItineraryBooking.status}
                  </span>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-foreground">{selectedItineraryBooking.contactFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{selectedItineraryBooking.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{selectedItineraryBooking.contactPhone}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium text-foreground">{selectedItineraryBooking.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Travel Dates</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedItineraryBooking.travelStartDate).toLocaleDateString()} - {new Date(selectedItineraryBooking.travelEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Travelers</p>
                      <p className="font-medium text-foreground">{selectedItineraryBooking.travelerCount}</p>
                    </div>
                  </div>
                </div>

                {/* Fee */}
                <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Consultation Fee:</span>
                    <span className="text-3xl font-bold text-primary">
                      GHS {Number(selectedItineraryBooking.finalFee || selectedItineraryBooking.feeEstimate || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-sm text-muted-foreground">
                  <p>Requested on: {new Date(selectedItineraryBooking.createdAt).toLocaleString()}</p>
                  {selectedItineraryBooking.confirmedAt && (
                    <p className="text-green-600 dark:text-green-400">
                      Confirmed on: {new Date(selectedItineraryBooking.confirmedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                {selectedItineraryBooking.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => {
                      setSelectedItineraryBooking(null);
                      router.push(`/payment?itineraryId=${selectedItineraryBooking.id}`);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => setSelectedItineraryBooking(null)}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
