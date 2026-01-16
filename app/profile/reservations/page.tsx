'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, Calendar, MapPin, Users, Mail, Phone, Plus, Send, Loader2, X, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '@/app/components/PageLoader';

type ReservationType = 'FLIGHT' | 'HOTEL' | 'BOTH';
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Reservation {
  id: string;
  reservationType: ReservationType;
  status: ReservationStatus;
  fullName: string;
  email: string;
  phone: string;
  flightType: string | null;
  departureCity: string | null;
  arrivalCity: string | null;
  departureDate: string | null;
  returnDate: string | null;
  passengers: number | null;
  travelClass: string | null;
  hotelCity: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  rooms: number | null;
  guests: number | null;
  hotelPreference: string | null;
  specialRequests: string | null;
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [reservationType, setReservationType] = useState<ReservationType>('BOTH');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    flightType: 'ROUND_TRIP',
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    travelClass: 'ECONOMY',
    hotelCity: '',
    checkInDate: '',
    checkOutDate: '',
    rooms: 1,
    guests: 1,
    hotelPreference: '',
    specialRequests: '',
  });

  useEffect(() => {
    checkAdminStatus();
    fetchReservations();
  }, []);

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

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reservations');
      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations);
      } else {
        toast.error('Failed to load reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all personal information');
      return;
    }

    if (reservationType === 'FLIGHT' || reservationType === 'BOTH') {
      if (!formData.departureCity || !formData.arrivalCity || !formData.departureDate) {
        toast.error('Please fill in all flight details');
        return;
      }
      if (formData.flightType === 'ROUND_TRIP' && !formData.returnDate) {
        toast.error('Please provide return date for round trip');
        return;
      }
    }

    if (reservationType === 'HOTEL' || reservationType === 'BOTH') {
      if (!formData.hotelCity || !formData.checkInDate || !formData.checkOutDate) {
        toast.error('Please fill in all hotel details');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reservationType,
        }),
      });

      if (response.ok) {
        toast.success('Reservation request submitted successfully! We will contact you shortly.');
        setShowNewReservationModal(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          flightType: 'ROUND_TRIP',
          departureCity: '',
          arrivalCity: '',
          departureDate: '',
          returnDate: '',
          passengers: 1,
          travelClass: 'ECONOMY',
          hotelCity: '',
          checkInDate: '',
          checkOutDate: '',
          rooms: 1,
          guests: 1,
          hotelPreference: '',
          specialRequests: '',
        });
        setReservationType('BOTH');
        fetchReservations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit reservation');
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast.error('Failed to submit reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reservations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reservation cancelled successfully');
        fetchReservations();
      } else {
        toast.error('Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Failed to cancel reservation');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Reservation ${newStatus.toLowerCase()} successfully`);
        fetchReservations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update reservation');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation');
    }
  };

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return CheckCircle;
      case 'PENDING':
        return Clock;
      case 'CANCELLED':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: ReservationType) => {
    switch (type) {
      case 'FLIGHT':
        return 'from-blue-500 to-cyan-500';
      case 'HOTEL':
        return 'from-purple-500 to-pink-500';
      case 'BOTH':
        return 'from-primary to-accent';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Hotel & Flight Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">Book your travel accommodations with us</p>
        </div>
        <button
          onClick={() => setShowNewReservationModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </button>
      </div>

      {/* Reservations List */}
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Your Reservations</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <PageLoader text="Loading reservations..." />
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Reservations Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first reservation to get started
              </p>
              <button
                onClick={() => setShowNewReservationModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Reservation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => {
                const StatusIcon = getStatusIcon(reservation.status);
                
                return (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background border-2 border-border rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${getTypeColor(reservation.reservationType)} flex items-center justify-center`}>
                          {reservation.reservationType === 'FLIGHT' && <Plane className="w-6 h-6 text-white" />}
                          {reservation.reservationType === 'HOTEL' && <Hotel className="w-6 h-6 text-white" />}
                          {reservation.reservationType === 'BOTH' && (
                            <div className="flex gap-1">
                              <Plane className="w-5 h-5 text-white" />
                              <Hotel className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-foreground text-base sm:text-lg capitalize truncate">
                            {reservation.reservationType.toLowerCase().replace('_', ' ')} Reservation
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Created {new Date(reservation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(reservation.status)}`}>
                        <StatusIcon className="w-3 h-3 flex-shrink-0" />
                        <span>{reservation.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Flight Details */}
                      {(reservation.reservationType === 'FLIGHT' || reservation.reservationType === 'BOTH') && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-foreground">Flight Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{reservation.departureCity} → {reservation.arrivalCity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{reservation.departureDate && new Date(reservation.departureDate).toLocaleDateString()}</span>
                              {reservation.returnDate && <span>- {new Date(reservation.returnDate).toLocaleDateString()}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{reservation.passengers} passenger(s) • {reservation.travelClass}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hotel Details */}
                      {(reservation.reservationType === 'HOTEL' || reservation.reservationType === 'BOTH') && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Hotel className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-foreground">Hotel Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{reservation.hotelCity}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {reservation.checkInDate && new Date(reservation.checkInDate).toLocaleDateString()} - 
                                {reservation.checkOutDate && new Date(reservation.checkOutDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{reservation.rooms} room(s) • {reservation.guests} guest(s)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1 min-w-0">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{reservation.email}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="break-all sm:break-normal">{reservation.phone}</span>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="p-3 bg-muted/30 rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Special Requests:</strong> {reservation.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* Admin Actions */}
                      {isAdmin && (
                        <>
                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                              className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Confirm</span>
                            </button>
                          )}
                          {reservation.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'COMPLETED')}
                              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Complete</span>
                            </button>
                          )}
                          {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                              className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <XCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* User Actions */}
                      {!isAdmin && reservation.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4 flex-shrink-0" />
                          <span>Cancel Reservation</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Reservation Modal - keeping the existing modal code */}
      <AnimatePresence>
        {showNewReservationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowNewReservationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl bg-card rounded-2xl border-2 border-border z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">New Reservation Request</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fill in the details and we'll process your booking
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewReservationModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Reservation Type Selector */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => setReservationType('FLIGHT')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      reservationType === 'FLIGHT'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Plane className="w-5 h-5" />
                    Flight Only
                  </button>
                  <button
                    onClick={() => setReservationType('HOTEL')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      reservationType === 'HOTEL'
                        ? 'bg-purple-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Hotel className="w-5 h-5" />
                    Hotel Only
                  </button>
                  <button
                    onClick={() => setReservationType('BOTH')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      reservationType === 'BOTH'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Plane className="w-4 h-4" />
                    <Hotel className="w-4 h-4" />
                    Both
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="+233 123 456 789"
                      />
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                {(reservationType === 'FLIGHT' || reservationType === 'BOTH') && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Plane className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Flight Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Flight Type
                        </label>
                        <select
                          name="flightType"
                          value={formData.flightType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option value="ONE_WAY">One Way</option>
                          <option value="ROUND_TRIP">Round Trip</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            From (Departure City) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="departureCity"
                            value={formData.departureCity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Accra"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            To (Arrival City) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="arrivalCity"
                            value={formData.arrivalCity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="Dubai"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Departure Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="departureDate"
                            value={formData.departureDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        {formData.flightType === 'ROUND_TRIP' && (
                          <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                              Return Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="returnDate"
                              value={formData.returnDate}
                              min={formData.departureDate || new Date().toISOString().split('T')[0]}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Passengers
                          </label>
                          <input
                            type="number"
                            name="passengers"
                            value={formData.passengers}
                            min="1"
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Travel Class
                          </label>
                          <select
                            name="travelClass"
                            value={formData.travelClass}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          >
                            <option value="ECONOMY">Economy</option>
                            <option value="BUSINESS">Business</option>
                            <option value="FIRST_CLASS">First Class</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hotel Details */}
                {(reservationType === 'HOTEL' || reservationType === 'BOTH') && (
                  <div className="p-6 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Hotel className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Hotel Details</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          City/Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="hotelCity"
                          value={formData.hotelCity}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Dubai"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Check-in Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="checkInDate"
                            value={formData.checkInDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Check-out Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="checkOutDate"
                            value={formData.checkOutDate}
                            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Rooms
                          </label>
                          <input
                            type="number"
                            name="rooms"
                            value={formData.rooms}
                            min="1"
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Guests
                          </label>
                          <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            min="1"
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Star Rating
                          </label>
                          <select
                            name="hotelPreference"
                            value={formData.hotelPreference}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          >
                            <option value="">Any</option>
                            <option value="3_STAR">3 Star</option>
                            <option value="4_STAR">4 Star</option>
                            <option value="5_STAR">5 Star</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Special Requests or Notes
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> This is a reservation request. Our team will review and send you booking options with pricing via email within 24 hours.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button
                  onClick={() => setShowNewReservationModal(false)}
                  className="flex-1 px-6 py-3 bg-background border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
