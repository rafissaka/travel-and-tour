'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, Plus, Loader2, CheckCircle, XCircle, AlertCircle, Trash2, Eye, FileText, Plane, BookOpen, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

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
  imageUrl: string | null;
  startDate: string | null;
}

interface Booking {
  id: string;
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

type TabType = 'bookings' | 'applications' | 'reservations';

export default function MyBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'booking' | 'application' | 'reservation'; title: string } | null>(null);
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

    // Check for tab query parameter
    const tab = searchParams.get('tab');
    if (tab && (tab === 'bookings' || tab === 'applications' || tab === 'reservations')) {
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

    // TODO: Integrate with payment gateway (Stripe, PayPal, Paystack, etc.)
    // For now, redirect to a payment page or show payment modal

    // Example: Redirect to payment page with booking details
    router.push(`/payment?bookingId=${booking.id}&amount=${booking.totalAmount || 0}`);

    // Or you can update payment status directly for testing:
    // try {
    //   const response = await fetch('/api/bookings', {
    //     method: 'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       id: booking.id,
    //       paymentStatus: 'PAID',
    //     }),
    //   });
    //   if (response.ok) {
    //     toast.success('Payment successful!');
    //     fetchBookings();
    //   }
    // } catch (error) {
    //   toast.error('Payment failed');
    // }
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
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isAdmin ? 'Appointments' : 'My Bookings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin 
              ? `Manage booking requests, applications, and reservations (${totalCount} total)` 
              : 'Manage your appointment requests'}
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
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          {activeTab === 'applications' ? 'New Application' : 
           activeTab === 'reservations' ? 'New Reservation' : 
           'New Booking'}
        </button>
      </div>

      {/* Tabs - Only show for admins */}
      {isAdmin && (
        <div className="bg-card rounded-xl border-2 border-border p-1 flex flex-col sm:flex-row gap-1">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'bookings'
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden md:inline">Service Bookings</span>
            <span className="md:hidden">Bookings</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'bookings' ? 'bg-white/20' : 'bg-muted'
            }`}>
              {bookings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'applications'
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden md:inline">Applications</span>
            <span className="md:hidden">Apps</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'applications' ? 'bg-white/20' : 'bg-muted'
            }`}>
              {applications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
              activeTab === 'reservations'
                ? 'bg-primary text-white shadow-lg'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Plane className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden md:inline">Flight/Hotel</span>
            <span className="md:hidden">Travel</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'reservations' ? 'bg-white/20' : 'bg-muted'
            }`}>
              {reservations.length}
            </span>
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
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

                  {/* Total Amount */}
                  {booking.totalAmount && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground pt-2 border-t border-border">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span>Total: ${Number(booking.totalAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 px-4 py-2.5 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span>View Details</span>
                  </button>

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
      ) : (
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
      )}

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
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-card rounded-2xl border-2 border-border z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Request Appointment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Book an appointment with us for consultation
                </p>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Select Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
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
              </div>

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
    </div>
  );
}
