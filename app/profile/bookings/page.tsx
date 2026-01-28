'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, User, Users, Phone, MessageSquare, Plus, Loader2, 
  CheckCircle, XCircle, AlertCircle, Trash2, Eye, FileText, Plane, 
  BookOpen, DollarSign, CreditCard, Edit, X, MapPin, Building2, 
  GraduationCap, Star, ArrowRight, Globe, Search, Filter, 
  ChevronDown, MoreVertical, RefreshCw, Download, TrendingUp,
  Briefcase, Mail, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import PageLoader from '@/app/components/PageLoader';
import ConsultationForm from '@/app/components/ConsultationForm';
import VisaAssistanceForm from '@/app/components/VisaAssistanceForm';
import ItineraryPlanningForm from '@/app/components/ItineraryPlanningForm';

// ==================== TYPES ====================
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
type StatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// ==================== HELPER COMPONENTS ====================

// Status Badge Component
const StatusBadge = ({ status, size = 'default' }: { status: string; size?: 'default' | 'small' }) => {
  const sizeClasses = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    CONFIRMED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Clock },
    CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
    COMPLETED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: CheckCircle },
    PAID: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
    REFUNDED: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: DollarSign },
  };

  const config = configs[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} ${config.bg} ${config.text} rounded-full font-semibold`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend }: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
  trend?: number;
}) => (
  <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, action, actionLabel }: {
  icon: any;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 bg-card border-2 border-dashed border-border rounded-2xl">
    <div className="p-4 bg-muted rounded-full mb-4">
      <Icon className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
    {action && actionLabel && (
      <button
        onClick={action}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {actionLabel}
      </button>
    )}
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
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

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    checkAdminStatus();
    fetchBookings();
    fetchServices();
    fetchConsultations();
    fetchVisaBookings();
    fetchItineraryBookings();
    fetchEvents();
    fetchPrograms();

    const tab = searchParams.get('tab');
    if (tab && ['bookings', 'applications', 'reservations', 'consultations'].includes(tab)) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
      fetchReservations();
    }
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

  const refreshData = () => {
    setLoading(true);
    fetchBookings();
    fetchConsultations();
    fetchVisaBookings();
    fetchItineraryBookings();
    if (isAdmin) {
      fetchApplications();
      fetchReservations();
    }
  };

  // ==================== HANDLERS ====================
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
          response = await fetch(`/api/bookings?id=${deleteTarget.id}`, { method: 'DELETE' });
          successMessage = 'Booking cancelled successfully';
          errorMessage = 'Failed to cancel booking';
          break;
        case 'application':
          response = await fetch(`/api/applications/${deleteTarget.id}`, { method: 'DELETE' });
          successMessage = 'Application deleted successfully';
          errorMessage = 'Failed to delete application';
          break;
        case 'reservation':
          response = await fetch(`/api/reservations?id=${deleteTarget.id}`, { method: 'DELETE' });
          successMessage = 'Reservation cancelled successfully';
          errorMessage = 'Failed to cancel reservation';
          break;
      }

      if (response && response.ok) {
        toast.success(successMessage);
        if (deleteTarget.type === 'booking') fetchBookings();
        else if (deleteTarget.type === 'application') fetchApplications();
        else if (deleteTarget.type === 'reservation') fetchReservations();
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
    const fee = base * 0.02;
    const total = base + fee;
    return { base, fee, total };
  };

  // ==================== COMPUTED VALUES ====================
  const totalConsultations = consultations.length + visaBookings.length + itineraryBookings.length;
  const totalRecords = bookings.length + applications.length + reservations.length + totalConsultations;

  // Filter function for search and status
  const filterItems = <T extends { status?: string; paymentStatus?: string }>(
    items: T[],
    searchFields: (item: T) => string[]
  ) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        searchFields(item).some(field => 
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus = statusFilter === 'all' || 
        item.status === statusFilter || 
        item.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredBookings = useMemo(() => 
    filterItems(bookings, (b) => [
      b.service?.title || '', 
      b.event?.title || '', 
      b.user?.firstName || '',
      b.user?.lastName || '',
      b.user?.email || ''
    ]), [bookings, searchQuery, statusFilter]);

  const filteredConsultations = useMemo(() => 
    filterItems(consultations, (c) => [
      c.contactFullName, 
      c.contactEmail, 
      c.service.title
    ]), [consultations, searchQuery, statusFilter]);

  const filteredVisaBookings = useMemo(() => 
    filterItems(visaBookings, (v) => [
      v.contactFullName, 
      v.destinationCountry, 
      v.contactEmail
    ]), [visaBookings, searchQuery, statusFilter]);

  const filteredItineraryBookings = useMemo(() => 
    filterItems(itineraryBookings, (i) => [
      i.contactFullName, 
      i.destination, 
      i.contactEmail
    ]), [itineraryBookings, searchQuery, statusFilter]);

  const filteredApplications = useMemo(() => 
    filterItems(applications, (a) => [
      a.programName, 
      a.programCountry, 
      a.user?.firstName || '',
      a.user?.email || ''
    ]), [applications, searchQuery, statusFilter]);

  const filteredReservations = useMemo(() => 
    filterItems(reservations, (r) => [
      r.departureCity || '', 
      r.arrivalCity || '', 
      r.hotelCity || '',
      r.user?.firstName || ''
    ]), [reservations, searchQuery, statusFilter]);

  // Tab configuration
  const adminTabs = [
    { id: 'bookings', icon: BookOpen, label: 'Bookings', count: bookings.length },
    { id: 'applications', icon: FileText, label: 'Applications', count: applications.length },
    { id: 'reservations', icon: Plane, label: 'Reservations', count: reservations.length },
    { id: 'consultations', icon: Users, label: 'Consultations', count: totalConsultations },
  ];

  const userTabs = [
    { id: 'consultations', icon: Users, label: 'Consultations', count: totalConsultations },
    { id: 'bookings', icon: BookOpen, label: 'Bookings', count: bookings.length },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  // ==================== RENDER ====================
  if (loading) {
    return <PageLoader text="Loading bookings..." />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* ==================== HEADER SECTION ==================== */}
      <div className="bg-card border border-border rounded-2xl">
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-purple-600 p-6 sm:p-8 rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {isAdmin ? 'Booking Management' : 'My Bookings'}
                </h1>
                <p className="text-white/80 mt-1">
                  {isAdmin 
                    ? `Manage all bookings and requests • ${totalRecords} total records`
                    : 'Track and manage your travel bookings'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshData}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (activeTab === 'applications') router.push('/profile/applications/new');
                    else if (activeTab === 'reservations') router.push('/profile/reservations');
                    else setShowNewBookingModal(true);
                  }}
                  className="px-5 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={BookOpen} 
              label="Service Bookings" 
              value={bookings.length} 
              color="bg-blue-500"
            />
            <StatCard 
              icon={Users} 
              label="Consultations" 
              value={totalConsultations} 
              color="bg-purple-500"
            />
            {isAdmin && (
              <>
                <StatCard 
                  icon={FileText} 
                  label="Applications" 
                  value={applications.length} 
                  color="bg-emerald-500"
                />
                <StatCard 
                  icon={Plane} 
                  label="Reservations" 
                  value={reservations.length} 
                  color="bg-orange-500"
                />
              </>
            )}
            {!isAdmin && (
              <>
                <StatCard 
                  icon={CheckCircle} 
                  label="Confirmed" 
                  value={bookings.filter(b => b.status === 'CONFIRMED').length + consultations.filter(c => c.status === 'CONFIRMED').length} 
                  color="bg-emerald-500"
                />
                <StatCard 
                  icon={Clock} 
                  label="Pending" 
                  value={bookings.filter(b => b.status === 'PENDING').length + consultations.filter(c => c.paymentStatus === 'PENDING').length} 
                  color="bg-amber-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 sm:p-6 bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, service, destination..."
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="px-4 py-3 bg-background border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2 min-w-[140px]"
              >
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {statusFilter === 'all' ? 'All Status' : statusFilter}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>
              
              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-[100] overflow-hidden"
                  >
                    {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status as StatusFilter);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                          statusFilter === status ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                      >
                        {status === 'all' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== TABS NAVIGATION ==================== */}
      <div className="bg-card border border-border rounded-2xl p-2">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[120px] relative px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== CONTENT SECTIONS ==================== */}
      <AnimatePresence mode="wait">
        {/* CONSULTATIONS TAB */}
        {activeTab === 'consultations' && (
          <motion.div
            key="consultations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Family Travel Consultations */}
            {filteredConsultations.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Family Travel Consultations</h2>
                  <span className="text-sm text-muted-foreground">({filteredConsultations.length})</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredConsultations.map((consultation) => (
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {consultation.contactFullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{consultation.contactFullName}</h3>
                            <p className="text-sm text-muted-foreground">{consultation.service.title}</p>
                          </div>
                        </div>
                        <StatusBadge status={consultation.paymentStatus} />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{new Date(consultation.travelStartDate).toLocaleDateString()} - {new Date(consultation.travelEndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{consultation.travelerCount} Traveler(s)</span>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 text-primary" />
                            <span>{consultation.contactEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-xl font-bold text-primary">GHS {Number(consultation.feeEstimate).toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/profile/consultations/${consultation.id}`)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                          >
                            View
                          </button>
                          {consultation.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => router.push(`/payment?consultationId=${consultation.id}`)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Visa Assistance */}
            {filteredVisaBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Plane className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Visa Assistance</h2>
                  <span className="text-sm text-muted-foreground">({filteredVisaBookings.length})</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredVisaBookings.map((visa) => (
                    <motion.div
                      key={visa.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {visa.contactFullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{visa.contactFullName}</h3>
                            <p className="text-sm text-muted-foreground">Visa Assistance</p>
                          </div>
                        </div>
                        <StatusBadge status={visa.paymentStatus} />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{visa.destinationCountry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4 text-purple-500" />
                          <span>{visa.travelPurpose}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span>{visa.applicantCount} Applicant(s)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-xl font-bold text-primary">GHS {Number(visa.finalFee || visa.feeEstimate || 0).toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedVisaBooking(visa)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                          >
                            View
                          </button>
                          {visa.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => router.push(`/payment?visaAssistanceId=${visa.id}`)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary Planning */}
            {filteredItineraryBookings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Itinerary Planning</h2>
                  <span className="text-sm text-muted-foreground">({filteredItineraryBookings.length})</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredItineraryBookings.map((itinerary) => (
                    <motion.div
                      key={itinerary.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {itinerary.contactFullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{itinerary.contactFullName}</h3>
                            <p className="text-sm text-muted-foreground">Itinerary Planning</p>
                          </div>
                        </div>
                        <StatusBadge status={itinerary.paymentStatus} />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{itinerary.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>{new Date(itinerary.travelStartDate).toLocaleDateString()} - {new Date(itinerary.travelEndDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span>{itinerary.travelerCount} Traveler(s)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-xl font-bold text-primary">GHS {Number(itinerary.finalFee || itinerary.feeEstimate || 0).toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedItineraryBooking(itinerary)}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                          >
                            View
                          </button>
                          {itinerary.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => router.push(`/payment?itineraryId=${itinerary.id}`)}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {filteredConsultations.length === 0 && filteredVisaBookings.length === 0 && filteredItineraryBookings.length === 0 && (
              <EmptyState
                icon={Users}
                title="No consultations found"
                description="Start by booking a consultation for family travel, visa assistance, or itinerary planning."
                action={() => router.push('/services/family-travel')}
                actionLabel="Book Consultation"
              />
            )}
          </motion.div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {filteredBookings.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No bookings found"
                description="Request an appointment with one of our services to get started."
                action={() => setShowNewBookingModal(true)}
                actionLabel="Request Appointment"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    {/* Image Header */}
                    {(booking.service?.imageUrl || booking.event?.imageUrl) && (
                      <div className="h-40 relative overflow-hidden">
                        <img
                          src={booking.service?.imageUrl || booking.event?.imageUrl || ''}
                          alt={booking.service?.title || booking.event?.title || ''}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg line-clamp-1">
                            {booking.service?.title || booking.event?.title}
                          </h3>
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <StatusBadge status={booking.status} size="small" />
                          <StatusBadge status={booking.paymentStatus} size="small" />
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Admin: Show client info */}
                      {isAdmin && booking.user && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {booking.user.firstName} {booking.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Booking Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>Requested: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                        {booking.participants > 1 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{booking.participants} participant(s)</span>
                          </div>
                        )}
                        {booking.totalAmount && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span>GH₵ {Number(booking.totalAmount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        
                        {!isAdmin && booking.event && booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="px-3 py-2 bg-blue-500/10 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        
                        {!isAdmin && booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handlePayNow(booking)}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay
                          </button>
                        )}
                        
                        {!isAdmin && booking.status === 'PENDING' && (
                          <button
                            onClick={() => openDeleteModal(booking.id, 'booking', booking.service?.title || booking.event?.title || 'this booking')}
                            className="px-3 py-2 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* APPLICATIONS TAB (Admin Only) */}
        {activeTab === 'applications' && isAdmin && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {filteredApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No applications found"
                description="Applications for study programs will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredApplications.map((application) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => router.push(`/profile/applications/${application.id}`)}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{application.programName}</h3>
                          <p className="text-sm text-muted-foreground">{application.programCountry}</p>
                        </div>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    {application.user && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {application.user.firstName} {application.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{application.user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                      {application.submittedAt && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* RESERVATIONS TAB (Admin Only) */}
        {activeTab === 'reservations' && isAdmin && (
          <motion.div
            key="reservations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {filteredReservations.length === 0 ? (
              <EmptyState
                icon={Plane}
                title="No reservations found"
                description="Flight and hotel reservations will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredReservations.map((reservation) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => router.push('/profile/reservations')}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Plane className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">
                            {reservation.reservationType === 'FLIGHT' && 'Flight Reservation'}
                            {reservation.reservationType === 'HOTEL' && 'Hotel Reservation'}
                            {reservation.reservationType === 'BOTH' && 'Flight & Hotel'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {reservation.reservationType === 'FLIGHT' && `${reservation.departureCity} → ${reservation.arrivalCity}`}
                            {reservation.reservationType === 'HOTEL' && `Hotel in ${reservation.hotelCity}`}
                            {reservation.reservationType === 'BOTH' && `Trip to ${reservation.arrivalCity || reservation.hotelCity}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={reservation.status} />
                    </div>

                    {reservation.user && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {reservation.user.firstName} {reservation.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4 border-t border-border">
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
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODALS ==================== */}
      
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full ${
                services.find(s => s.id === formData.serviceId)?.slug === 'family-travel' ? 'sm:max-w-5xl' :
                ['tours', 'study-programs'].includes(services.find(s => s.id === formData.serviceId)?.slug || '') ? 'sm:max-w-4xl' : 'sm:max-w-2xl'
              } bg-card rounded-2xl border border-border z-50 overflow-hidden flex flex-col max-h-[90vh]`}
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {services.find(s => s.id === formData.serviceId)?.slug === 'family-travel' ? 'Family Travel Consultation' :
                       services.find(s => s.id === formData.serviceId)?.slug === 'tours' ? 'Select Tour Event' :
                       services.find(s => s.id === formData.serviceId)?.slug === 'study-programs' ? 'Select Program' : 'Request Appointment'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Choose a service to get started</p>
                  </div>
                  <button
                    onClick={() => setShowNewBookingModal(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                      if (selectedService && (selectedService.slug === 'reservations' || selectedService.title === 'Hotel & Flight Reservations')) {
                        setShowNewBookingModal(false);
                        toast.info('Redirecting to flight & hotel reservations...');
                        router.push('/services/reservations');
                      } else {
                        setFormData({ ...formData, serviceId: selectedServiceId });
                      }
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">-- Select a service --</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.title}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Forms */}
                {services.find(s => s.id === formData.serviceId)?.slug === 'family-travel' && (
                  <ConsultationForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({ serviceId: '', bookingType: 'SERVICE', participants: 1, specialRequests: '', preferredDate: '', preferredTime: '' });
                      fetchConsultations();
                    }}
                  />
                )}

                {services.find(s => s.id === formData.serviceId)?.slug === 'visa-assistance' && (
                  <VisaAssistanceForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({ serviceId: '', bookingType: 'SERVICE', participants: 1, specialRequests: '', preferredDate: '', preferredTime: '' });
                    }}
                  />
                )}

                {services.find(s => s.id === formData.serviceId)?.slug === 'itinerary' && (
                  <ItineraryPlanningForm
                    serviceId={formData.serviceId}
                    serviceTitle={services.find(s => s.id === formData.serviceId)?.title || ''}
                    onClose={() => {
                      setShowNewBookingModal(false);
                      setFormData({ serviceId: '', bookingType: 'SERVICE', participants: 1, specialRequests: '', preferredDate: '', preferredTime: '' });
                    }}
                  />
                )}

                {services.find(s => s.id === formData.serviceId)?.slug === 'tours' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select an event for tours booking:</p>
                    {events.length === 0 ? (
                      <EmptyState icon={Calendar} title="No events available" description="Check back later for upcoming tours." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => { setShowNewBookingModal(false); router.push(`/events/${event.slug}`); }}
                            className="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 border-2 border-transparent hover:border-primary transition-all group"
                          >
                            {event.imageUrl && (
                              <img src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                            )}
                            <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
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
                                  <span>GH₵ {Number(event.price).toFixed(2)}/person</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {services.find(s => s.id === formData.serviceId)?.slug === 'study-programs' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select a program:</p>
                    {programs.length === 0 ? (
                      <EmptyState icon={GraduationCap} title="No programs available" description="Check back later for programs." />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {programs.map((program) => (
                          <div
                            key={program.id}
                            onClick={() => { setShowNewBookingModal(false); router.push(`/programs/${program.slug}`); }}
                            className="bg-muted/30 rounded-xl p-4 cursor-pointer hover:bg-muted/50 border-2 border-transparent hover:border-primary transition-all"
                          >
                            {program.imageUrl && (
                              <img src={program.imageUrl} alt={program.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                            )}
                            <h3 className="font-semibold text-foreground mb-2">{program.title}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {program.country && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{program.country}</span>
                                </div>
                              )}
                              {program.university && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  <span>{program.university}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Generic Booking Form */}
                {formData.serviceId && !['family-travel', 'visa-assistance', 'itinerary', 'tours', 'study-programs'].includes(services.find(s => s.id === formData.serviceId)?.slug || '') && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Preferred Date *</label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Preferred Time *</label>
                        <input
                          type="time"
                          value={formData.preferredTime}
                          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Participants</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.participants}
                        onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Special Requests</label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Any specific requirements..."
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer with actions for generic booking */}
              {formData.serviceId && !['family-travel', 'visa-assistance', 'itinerary', 'tours', 'study-programs'].includes(services.find(s => s.id === formData.serviceId)?.slug || '') && (
                <div className="p-6 border-t border-border flex gap-3">
                  <button
                    onClick={() => setShowNewBookingModal(false)}
                    className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitBooking}
                    disabled={submitting || !formData.serviceId || !formData.preferredDate || !formData.preferredTime}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-card rounded-2xl border border-border z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Booking Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedBooking.service?.title || selectedBooking.event?.title}</p>
                  </div>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="font-semibold text-foreground">{selectedBooking.bookingType}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Participants</p>
                    <p className="font-semibold text-foreground">{selectedBooking.participants}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="font-semibold text-foreground capitalize">{selectedBooking.paymentStatus.toLowerCase()}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold text-foreground">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedBooking.totalAmount && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">GH₵ {Number(selectedBooking.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-border"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Edit Booking</h2>
                    <p className="text-sm text-muted-foreground mt-1">{editingBooking.event?.title}</p>
                  </div>
                  <button onClick={() => { setShowEditModal(false); setEditingBooking(null); }} className="p-2 hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Number of Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={editFormData.participants}
                    onChange={(e) => setEditFormData({ ...editFormData, participants: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {editingBooking.event?.price && (
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">GH₵ {calculateEditTotal().base.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service fee (2%)</span>
                      <span className="font-medium">GH₵ {calculateEditTotal().fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">GH₵ {calculateEditTotal().total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button onClick={() => { setShowEditModal(false); setEditingBooking(null); }} className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80">
                  Cancel
                </button>
                <button onClick={handleSubmitEdit} disabled={submitting} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden"
            >
              <div className="p-6 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Confirm</h2>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-foreground">
                  Are you sure you want to {deleteTarget.type === 'booking' ? 'cancel' : 'delete'}{' '}
                  <span className="font-semibold">"{deleteTarget.title}"</span>?
                </p>
              </div>

              <div className="p-6 bg-muted/30 border-t border-border flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }} className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg font-semibold hover:bg-muted">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {deleteTarget.type === 'booking' ? 'Cancel Booking' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visa Assistance Detail Modal */}
      <AnimatePresence>
        {selectedVisaBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedVisaBooking(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plane className="w-8 h-8 text-purple-600" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Visa Assistance Request</h2>
                      <p className="text-sm text-muted-foreground">ID: {selectedVisaBooking.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedVisaBooking(null)} className="p-2 hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="flex gap-2">
                  <StatusBadge status={selectedVisaBooking.paymentStatus} />
                  <StatusBadge status={selectedVisaBooking.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
                    <p className="font-medium text-foreground">{selectedVisaBooking.contactFullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-foreground">{selectedVisaBooking.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Destination</p>
                    <p className="font-medium text-foreground">{selectedVisaBooking.destinationCountry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Purpose</p>
                    <p className="font-medium text-foreground">{selectedVisaBooking.travelPurpose}</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Fee</span>
                    <span className="text-2xl font-bold text-primary">GHS {Number(selectedVisaBooking.finalFee || selectedVisaBooking.feeEstimate || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                {selectedVisaBooking.paymentStatus === 'PENDING' && (
                  <button onClick={() => { setSelectedVisaBooking(null); router.push(`/payment?visaAssistanceId=${selectedVisaBooking.id}`); }} className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </button>
                )}
                <button onClick={() => setSelectedVisaBooking(null)} className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Itinerary Detail Modal */}
      <AnimatePresence>
        {selectedItineraryBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItineraryBooking(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-orange-600" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Itinerary Planning Request</h2>
                      <p className="text-sm text-muted-foreground">ID: {selectedItineraryBooking.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedItineraryBooking(null)} className="p-2 hover:bg-muted rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="flex gap-2">
                  <StatusBadge status={selectedItineraryBooking.paymentStatus} />
                  <StatusBadge status={selectedItineraryBooking.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
                    <p className="font-medium text-foreground">{selectedItineraryBooking.contactFullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Destination</p>
                    <p className="font-medium text-foreground">{selectedItineraryBooking.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Travel Dates</p>
                    <p className="font-medium text-foreground">{new Date(selectedItineraryBooking.travelStartDate).toLocaleDateString()} - {new Date(selectedItineraryBooking.travelEndDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Travelers</p>
                    <p className="font-medium text-foreground">{selectedItineraryBooking.travelerCount}</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Fee</span>
                    <span className="text-2xl font-bold text-primary">GHS {Number(selectedItineraryBooking.finalFee || selectedItineraryBooking.feeEstimate || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                {selectedItineraryBooking.paymentStatus === 'PENDING' && (
                  <button onClick={() => { setSelectedItineraryBooking(null); router.push(`/payment?itineraryId=${selectedItineraryBooking.id}`); }} className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </button>
                )}
                <button onClick={() => setSelectedItineraryBooking(null)} className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
