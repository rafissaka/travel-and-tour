'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MapPin, Calendar, Users, DollarSign, CheckCircle, Clock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ItineraryBooking {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  tripDuration: string;
  travelerCount: number;
  budgetRange: string;
  status: string;
  paymentStatus: string;
  feeEstimate: number | null;
  finalFee: number | null;
  itineraryDelivered: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  service: {
    title: string;
  };
}

export default function ItineraryPlanningPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<ItineraryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ItineraryBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/itinerary-bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load itinerary bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            Itinerary Planning Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all itinerary planning requests
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-card border-2 border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="p-6 bg-card border-2 border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'PENDING').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="p-6 bg-card border-2 border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="p-6 bg-card border-2 border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.itineraryDelivered).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No itinerary requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Travel Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Travelers</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Delivered</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{booking.contactFullName}</p>
                          <p className="text-sm text-muted-foreground">{booking.contactEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{booking.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">
                          <p className="text-sm">{new Date(booking.travelStartDate).toLocaleDateString()}</p>
                          <p className="text-sm">to {new Date(booking.travelEndDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">({booking.tripDuration})</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{booking.travelerCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{booking.budgetRange || 'Not specified'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.itineraryDelivered ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-card rounded-2xl border-2 border-border shadow-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Itinerary Request Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-lg font-medium text-foreground">{selectedBooking.contactFullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="text-lg font-medium text-foreground">{selectedBooking.destination}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trip Duration</p>
                <p className="text-lg font-medium text-foreground">{selectedBooking.tripDuration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Travelers</p>
                <p className="text-lg font-medium text-foreground">{selectedBooking.travelerCount}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
