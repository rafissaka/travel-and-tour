'use client';

import { useState } from 'react';
import { X, Package, Plane, Hotel, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface PackageQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFlight: any;
  selectedHotel: any;
  flightForm: any;
  hotelForm: any;
  exchangeRate: number;
  onSuccess: () => void;
}

export default function PackageQuoteModal({
  isOpen,
  onClose,
  selectedFlight,
  selectedHotel,
  flightForm,
  hotelForm,
  exchangeRate,
  onSuccess,
}: PackageQuoteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const calculatePackagePricing = () => {
    const flightPriceUSD = parseFloat(selectedFlight.price.total);
    const hotelPriceUSD = parseFloat(selectedHotel.offers[0].price.total);
    
    const flightGHS = flightPriceUSD * exchangeRate;
    const hotelGHS = hotelPriceUSD * exchangeRate;
    
    const baseTotal = flightGHS + hotelGHS;
    const serviceFee = baseTotal * 0.10;
    const totalBeforeDiscount = baseTotal + serviceFee;
    const discount = totalBeforeDiscount * 0.05;
    const finalTotal = totalBeforeDiscount - discount;
    
    return {
      flightPriceUSD,
      hotelPriceUSD,
      flightGHS,
      hotelGHS,
      baseTotal,
      serviceFee,
      totalBeforeDiscount,
      discount,
      finalTotal,
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const pricing = calculatePackagePricing();
      const outbound = selectedFlight.itineraries[0];
      const segments = outbound.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      
      const checkIn = new Date(hotelForm.checkInDate);
      const checkOut = new Date(hotelForm.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      const packageData = {
        flightData: {
          origin: flightForm.origin,
          destination: flightForm.destination,
          departureDate: flightForm.departureDate,
          returnDate: flightForm.returnDate || null,
          adults: flightForm.adults,
          children: flightForm.children || 0,
          infants: flightForm.infants || 0,
          cabin: flightForm.cabin || 'ECONOMY',
          airline: selectedFlight.validatingAirlineCodes?.[0],
          flightNumber: firstSegment.number,
          departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(),
          arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(),
          duration: outbound.duration,
          stops: segments.length - 1,
          basePriceUSD: pricing.flightPriceUSD,
          flightDetails: selectedFlight,
        },
        hotelData: {
          city: selectedHotel.hotel.address?.cityName || hotelForm.city,
          country: selectedHotel.hotel.address?.countryCode,
          checkInDate: hotelForm.checkInDate,
          checkOutDate: hotelForm.checkOutDate,
          adults: hotelForm.adults,
          children: hotelForm.children || 0,
          rooms: hotelForm.rooms || 1,
          hotelName: selectedHotel.hotel.name,
          hotelAddress: selectedHotel.hotel.address?.lines?.join(', '),
          roomType: selectedHotel.offers[0].room?.typeEstimated?.category,
          amenities: selectedHotel.offers[0].room?.description || {},
          starRating: selectedHotel.hotel.rating,
          basePriceUSD: pricing.hotelPriceUSD,
          nights,
          hotelDetails: selectedHotel,
        },
        packageNotes: notes,
      };

      const response = await fetch('/api/reservations/packages/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Package quote submitted successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit package quote');
      }
    } catch (error) {
      console.error('Submit package quote error:', error);
      toast.error('Failed to submit package quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedFlight || !selectedHotel) return null;

  const pricing = calculatePackagePricing();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border-2 border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Request Package Quote
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Flight + Hotel with 5% Discount
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Package Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Flight */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Plane className="w-5 h-5 text-blue-600" />
                    Your Flight
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium">{flightForm.origin} → {flightForm.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date(flightForm.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passengers:</span>
                      <span className="font-medium">{flightForm.adults} Adult{flightForm.adults > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Hotel */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border-2 border-purple-200">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                    <Hotel className="w-5 h-5 text-purple-600" />
                    Your Hotel
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel:</span>
                      <span className="font-medium line-clamp-1">{selectedHotel.hotel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{new Date(hotelForm.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nights:</span>
                      <span className="font-medium">
                        {Math.ceil((new Date(hotelForm.checkOutDate).getTime() - new Date(hotelForm.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-6 border-2 border-orange-200">
                <h3 className="font-semibold text-foreground mb-4">Package Pricing Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Flight (${pricing.flightPriceUSD.toFixed(2)} USD):</span>
                    <span className="font-medium">GH₵ {pricing.flightGHS.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hotel (${pricing.hotelPriceUSD.toFixed(2)} USD):</span>
                    <span className="font-medium">GH₵ {pricing.hotelGHS.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">GH₵ {pricing.baseTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee (10%):</span>
                    <span className="font-medium">GH₵ {pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-semibold">Package Discount (5%):</span>
                    <span className="font-bold">-GH₵ {pricing.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-border pt-3 flex justify-between items-center">
                    <span className="font-bold text-foreground">Total Amount:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      GH₵ {pricing.finalTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-center text-green-600 font-medium bg-green-50 dark:bg-green-950/20 rounded-lg py-2">
                    🎉 You save GH₵ {pricing.discount.toFixed(2)} with this package!
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or requirements..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Your package quote will be reviewed by our team</li>
                    <li>We'll confirm pricing and availability for both bookings</li>
                    <li>You'll receive a payment link via email</li>
                    <li>Complete payment to confirm your entire package</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-4">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Request Package Quote
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
