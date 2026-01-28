'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, Calendar, MapPin, Users, Mail, CheckCircle, Clock, XCircle, X, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '@/app/components/PageLoader';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

type ReservationType = 'FLIGHT' | 'HOTEL' | 'PACKAGE';
type ReservationStatus = 'PENDING_QUOTE' | 'QUOTE_SENT' | 'QUOTE_APPROVED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Reservation {
  id: string;
  type: ReservationType;
  status: ReservationStatus;
  createdAt: string;

  // Flight fields
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: string;
  airline?: string;

  // Hotel fields
  city?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  rooms?: number;
  hotelName?: string;

  // Package fields - nested reservations
  flightReservation?: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    cabin: string;
    airline?: string;
    basePriceUSD?: number;
    basePriceGHS?: number;
  };
  hotelReservation?: {
    city: string;
    country?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    rooms: number;
    hotelName?: string;
    basePriceUSD?: number;
    basePriceGHS?: number;
  };

  // Common fields
  totalAmount?: number;
  basePriceUSD?: number;
  basePriceGHS?: number;

  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [quoteData, setQuoteData] = useState({
    finalPriceUSD: '',
    finalPriceGHS: '',
    adminNotes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAdminStatus();
    fetchReservations();
    fetchUserEmail();

    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
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

  const fetchUserEmail = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.user.email);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
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

  const handleOpenQuoteModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);

    // For package reservations, calculate total from nested reservations
    let estimatedUSD = 0;
    let estimatedGHS = 0;

    if (reservation.type === 'PACKAGE') {
      // Sum up flight and hotel prices if they exist
      if (reservation.flightReservation) {
        estimatedUSD += Number(reservation.flightReservation.basePriceUSD || 0);
        estimatedGHS += Number(reservation.flightReservation.basePriceGHS || 0);
      }
      if (reservation.hotelReservation) {
        estimatedUSD += Number(reservation.hotelReservation.basePriceUSD || 0);
        estimatedGHS += Number(reservation.hotelReservation.basePriceGHS || 0);
      }
    } else {
      // For single reservations, use direct price
      estimatedUSD = Number(reservation.basePriceUSD || 0);
      estimatedGHS = Number(reservation.basePriceGHS || 0);
    }

    setQuoteData({
      finalPriceUSD: estimatedUSD > 0 ? estimatedUSD.toString() : '',
      finalPriceGHS: estimatedGHS > 0 ? estimatedGHS.toString() : '',
      adminNotes: '',
    });
    setShowQuoteModal(true);
  };

  const handlePayNow = (reservation: Reservation) => {
    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.');
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey || paystackKey === '' || paystackKey === 'pk_test_xxxx') {
      toast.error('Payment system not configured. Please contact support.');
      console.error('Paystack public key not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your .env.local file');
      return;
    }

    const amount = Number(reservation.totalAmount || reservation.basePriceGHS || 0);

    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount. Please contact support.');
      return;
    }

    if (!userEmail) {
      toast.error('User email not found. Please try again.');
      return;
    }

    setPaymentLoading(reservation.id);

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: userEmail,
      amount: Math.round(amount * 100), // Convert to pesewas for GHS
      currency: 'GHS',
      ref: `${reservation.type}-${reservation.id}-${Date.now()}`,
      metadata: {
        reservationId: reservation.id,
        reservationType: reservation.type,
        custom_fields: [
          {
            display_name: 'Reservation Type',
            variable_name: 'reservation_type',
            value: reservation.type,
          },
          {
            display_name: 'Origin/Destination',
            variable_name: 'location',
            value: reservation.origin
              ? `${reservation.origin} → ${reservation.destination}`
              : reservation.city || 'N/A',
          },
        ],
      },
      onClose: function() {
        setPaymentLoading(null);
        toast.info('Payment window closed');
      },
      callback: function(response: any) {
        verifyPayment(response.reference, reservation.id, reservation.type);
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference: string, reservationId: string, reservationType: string) => {
    try {
      let endpoint: string;

      if (reservationType === 'FLIGHT') {
        endpoint = '/api/reservations/flights/payment/verify';
      } else if (reservationType === 'HOTEL') {
        endpoint = '/api/reservations/hotels/payment/verify';
      } else if (reservationType === 'PACKAGE') {
        endpoint = '/api/reservations/package/payment/verify';
      } else {
        toast.error('Invalid reservation type');
        setPaymentLoading(null);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          reservationId,
        }),
      });

      if (response.ok) {
        toast.success('Payment successful! Your reservation is confirmed.');
        setPaymentLoading(null);
        fetchReservations(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Payment verification failed');
        setPaymentLoading(null);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
      setPaymentLoading(null);
    }
  };

  const handleSendQuote = async () => {
    if (!selectedReservation) return;

    if (!quoteData.finalPriceUSD || !quoteData.finalPriceGHS) {
      toast.error('Please enter both USD and GHS prices');
      return;
    }

    setSubmitting(true);
    try {
      let endpoint: string;

      if (selectedReservation.type === 'FLIGHT') {
        endpoint = '/api/reservations/flights/quote';
      } else if (selectedReservation.type === 'HOTEL') {
        endpoint = '/api/reservations/hotels/quote';
      } else if (selectedReservation.type === 'PACKAGE') {
        endpoint = '/api/reservations/package/quote';
      } else {
        toast.error('Invalid reservation type');
        setSubmitting(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReservation.id,
          status: 'QUOTE_SENT',
          basePriceUSD: parseFloat(quoteData.finalPriceUSD),
          basePriceGHS: parseFloat(quoteData.finalPriceGHS),
          totalAmount: parseFloat(quoteData.finalPriceGHS),
          adminNotes: quoteData.adminNotes,
        }),
      });

      if (response.ok) {
        toast.success('Quote sent to customer successfully!');
        setShowQuoteModal(false);
        fetchReservations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote');
    } finally {
      setSubmitting(false);
    }
  };


  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'QUOTE_APPROVED':
        return CheckCircle;
      case 'PENDING_QUOTE':
      case 'QUOTE_SENT':
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
      case 'QUOTE_APPROVED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'PENDING_QUOTE':
      case 'QUOTE_SENT':
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
      case 'PACKAGE':
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isAdmin ? 'Manage Reservations' : 'My Reservations'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? 'Review and send quotes for flight and hotel reservations'
              : 'View and track your flight and hotel bookings'}
          </p>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {isAdmin ? 'All Customer Reservations' : 'Your Reservations'}
          </h2>
          {isAdmin && (
            <p className="text-sm text-muted-foreground mt-1">
              Click "Send Quote" to review and set final pricing for pending reservations
            </p>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <PageLoader text="Loading reservations..." />
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isAdmin ? 'No Reservations Found' : 'No Reservations Yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {isAdmin
                  ? 'Customer reservations will appear here when they request quotes'
                  : 'Search for flights and hotels to create your first reservation'}
              </p>
              {!isAdmin && (
                <a
                  href="/services"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                >
                  <Plane className="w-5 h-5" />
                  Explore Services
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Stats for Admin */}
              {isAdmin && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-1">Pending Quote</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {reservations.filter(r => r.status === 'PENDING_QUOTE').length}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Quote Sent</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {reservations.filter(r => r.status === 'QUOTE_SENT').length}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {reservations.filter(r => r.status === 'CONFIRMED').length}
                    </p>
                  </div>
                </div>
              )}
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
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${getTypeColor(reservation.type)} flex items-center justify-center`}>
                          {reservation.type === 'FLIGHT' && <Plane className="w-6 h-6 text-white" />}
                          {reservation.type === 'HOTEL' && <Hotel className="w-6 h-6 text-white" />}
                          {reservation.type === 'PACKAGE' && (
                            <div className="flex gap-1">
                              <Plane className="w-5 h-5 text-white" />
                              <Hotel className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-foreground text-base sm:text-lg capitalize truncate">
                            {reservation.type.toLowerCase()} Reservation
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Created {new Date(reservation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(reservation.status)}`}>
                        <StatusIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs">{reservation.status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Flight Details */}
                      {(reservation.type === 'FLIGHT' || (reservation.type === 'PACKAGE' && reservation.flightReservation)) && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-foreground">Flight Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            {/* Use flightReservation if it's a package, otherwise use direct fields */}
                            {(() => {
                              const flightData = reservation.type === 'PACKAGE'
                                ? reservation.flightReservation
                                : reservation;

                              if (!flightData) return null;

                              return (
                                <>
                                  {flightData.origin && flightData.destination && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{flightData.origin} → {flightData.destination}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>{flightData.departureDate && new Date(flightData.departureDate).toLocaleDateString()}</span>
                                    {flightData.returnDate && <span> - {new Date(flightData.returnDate).toLocaleDateString()}</span>}
                                  </div>
                                  {flightData.adults && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="w-3 h-3" />
                                      <span>
                                        {flightData.adults} Adult(s)
                                        {flightData.children ? ` • ${flightData.children} Child(ren)` : ''}
                                        {flightData.cabin ? ` • ${flightData.cabin}` : ''}
                                      </span>
                                    </div>
                                  )}
                                  {flightData.airline && (
                                    <div className="text-xs text-muted-foreground">
                                      Airline: {flightData.airline}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Hotel Details */}
                      {(reservation.type === 'HOTEL' || (reservation.type === 'PACKAGE' && reservation.hotelReservation)) && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Hotel className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-foreground">Hotel Details</h4>
                          </div>
                          <div className="space-y-2 text-sm">
                            {/* Use hotelReservation if it's a package, otherwise use direct fields */}
                            {(() => {
                              const hotelData = reservation.type === 'PACKAGE'
                                ? reservation.hotelReservation
                                : reservation;

                              if (!hotelData) return null;

                              return (
                                <>
                                  {hotelData.city && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{hotelData.city}{hotelData.country ? `, ${hotelData.country}` : ''}</span>
                                    </div>
                                  )}
                                  {hotelData.hotelName && (
                                    <div className="text-sm font-semibold text-foreground">
                                      {hotelData.hotelName}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {hotelData.checkInDate && new Date(hotelData.checkInDate).toLocaleDateString()} -
                                      {hotelData.checkOutDate && new Date(hotelData.checkOutDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {hotelData.rooms && hotelData.adults && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="w-3 h-3" />
                                      <span>{hotelData.rooms} Room(s) • {hotelData.adults} Guest(s)</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    {(reservation.totalAmount || reservation.basePriceGHS) && (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-foreground">Total Amount:</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            GH₵ {Number(reservation.totalAmount || reservation.basePriceGHS || 0).toFixed(2)}
                          </span>
                        </div>
                        {reservation.basePriceUSD && (
                          <div className="text-xs text-muted-foreground text-right mt-1">
                            ≈ ${Number(reservation.basePriceUSD).toFixed(2)} USD
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer Info - Admin View Only */}
                    {isAdmin && reservation.user && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg mb-4 border border-purple-200 dark:border-purple-800">
                        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">Customer Information</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-purple-800 dark:text-purple-300">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{reservation.user.email}</span>
                          </div>
                          {reservation.user.firstName && (
                            <div className="text-sm text-purple-700 dark:text-purple-300">
                              <strong>Name:</strong> {reservation.user.firstName} {reservation.user.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Info */}
                    <div className={`p-3 rounded-lg mb-4 ${
                      reservation.status === 'PENDING_QUOTE' ? 'bg-yellow-50 dark:bg-yellow-900/10' :
                      reservation.status === 'QUOTE_SENT' ? 'bg-blue-50 dark:bg-blue-900/10' :
                      reservation.status === 'CONFIRMED' ? 'bg-green-50 dark:bg-green-900/10' :
                      'bg-gray-50 dark:bg-gray-900/10'
                    }`}>
                      <p className={`text-xs font-medium ${
                        reservation.status === 'PENDING_QUOTE' ? 'text-yellow-800 dark:text-yellow-200' :
                        reservation.status === 'QUOTE_SENT' ? 'text-blue-800 dark:text-blue-200' :
                        reservation.status === 'CONFIRMED' ? 'text-green-800 dark:text-green-200' :
                        'text-gray-800 dark:text-gray-200'
                      }`}>
                        <strong>Status:</strong> {reservation.status.replace('_', ' ')}
                        {isAdmin ? (
                          <>
                            {reservation.status === 'PENDING_QUOTE' && ' - Waiting for you to send a quote'}
                            {reservation.status === 'QUOTE_SENT' && ' - Quote sent, waiting for customer payment'}
                            {reservation.status === 'CONFIRMED' && ' - Payment received, booking confirmed'}
                          </>
                        ) : (
                          <>
                            {reservation.status === 'PENDING_QUOTE' && ' - Our team will review and send you a quote soon'}
                            {reservation.status === 'QUOTE_SENT' && ' - Review the quote below and click Pay Now to confirm'}
                            {reservation.status === 'CONFIRMED' && ' - Your payment is confirmed! We will contact you with booking details'}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        {reservation.status === 'PENDING_QUOTE' && (
                          <button
                            onClick={() => handleOpenQuoteModal(reservation)}
                            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Send Quote
                          </button>
                        )}
                        {reservation.status === 'QUOTE_SENT' && (
                          <button
                            onClick={() => handleOpenQuoteModal(reservation)}
                            className="px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Update Quote
                          </button>
                        )}
                      </div>
                    )}

                    {/* User Pay Now Button */}
                    {!isAdmin && reservation.status === 'QUOTE_SENT' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePayNow(reservation)}
                          disabled={paymentLoading === reservation.id}
                          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentLoading === reservation.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Pay Now - GH₵ {Number(reservation.totalAmount || reservation.basePriceGHS || 0).toFixed(2)}
                            </>
                          )}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                          Secure payment via Paystack
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && selectedReservation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuoteModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border-2 border-border shadow-2xl z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedReservation.status === 'PENDING_QUOTE' ? 'Send Quote' : 'Update Quote'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Set final pricing for this reservation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Reservation Summary */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Reservation Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium text-foreground capitalize">{selectedReservation.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {selectedReservation.user?.firstName} {selectedReservation.user?.lastName}
                      </span>
                    </div>

                    {/* Flight details - direct or from package */}
                    {(() => {
                      const flightData = selectedReservation.type === 'PACKAGE'
                        ? selectedReservation.flightReservation
                        : selectedReservation;

                      if (flightData?.origin && flightData?.destination) {
                        return (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Flight Route:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {flightData.origin} → {flightData.destination}
                            </span>
                            {flightData.departureDate && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({new Date(flightData.departureDate).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Hotel details - direct or from package */}
                    {(() => {
                      const hotelData = selectedReservation.type === 'PACKAGE'
                        ? selectedReservation.hotelReservation
                        : selectedReservation;

                      if (hotelData?.city) {
                        return (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Hotel Location:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {hotelData.city}{hotelData.country ? `, ${hotelData.country}` : ''}
                            </span>
                            {hotelData.checkInDate && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({new Date(hotelData.checkInDate).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Current Pricing */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-2">Current Estimated Price</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">USD:</span>
                      <span className="ml-2 font-bold text-foreground">
                        ${Number(selectedReservation.basePriceUSD || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">GHS:</span>
                      <span className="ml-2 font-bold text-foreground">
                        GH₵ {Number(selectedReservation.basePriceGHS || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Pricing Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Set Final Quote Price</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Final Price (USD) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={quoteData.finalPriceUSD}
                        onChange={(e) => setQuoteData({ ...quoteData, finalPriceUSD: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Final Price (GHS) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={quoteData.finalPriceGHS}
                        onChange={(e) => setQuoteData({ ...quoteData, finalPriceGHS: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={quoteData.adminNotes}
                      onChange={(e) => setQuoteData({ ...quoteData, adminNotes: e.target.value })}
                      placeholder="Any special notes or conditions for this quote..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      <li>Customer will be notified via email about the quote</li>
                      <li>They can review and pay directly on the website</li>
                      <li>Payment will be processed through Paystack</li>
                      <li>Reservation will be confirmed after successful payment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-4">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuote}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Send Quote to Customer
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
