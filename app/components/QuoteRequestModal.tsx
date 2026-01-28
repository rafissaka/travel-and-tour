'use client';

import { useState } from 'react';
import { X, Plane, Hotel, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'flight' | 'hotel';
  selectedItem: any;
  searchParams: any;
  exchangeRate: number;
  onSuccess: () => void;
}

export default function QuoteRequestModal({
  isOpen,
  onClose,
  type,
  selectedItem,
  searchParams,
  exchangeRate,
  onSuccess,
}: QuoteRequestModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  // Debug logging
  if (selectedItem && isOpen) {
    console.log('Selected Item:', selectedItem);
    console.log('Type:', type);
    if (type === 'flight') {
      console.log('Flight Price:', selectedItem.price);
    } else {
      console.log('Hotel Offers:', selectedItem.offers);
      console.log('Hotel First Offer Price:', selectedItem.offers?.[0]?.price);
    }
  }

  const calculatePricing = (priceUSD: number) => {
    const baseGHS = priceUSD * exchangeRate;
    const serviceFee = baseGHS * 0.10;
    const total = baseGHS + serviceFee;
    
    return {
      baseUSD: priceUSD,
      baseGHS,
      serviceFee,
      total,
    };
  };

  const handleSubmitFlightQuote = async () => {
    if (!selectedItem) return;

    setSubmitting(true);

    try {
      const outbound = selectedItem.itineraries[0];
      const segments = outbound.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      const pricing = calculatePricing(parseFloat(selectedItem.price.total));

      const quoteData = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || null,
        adults: searchParams.adults,
        children: searchParams.children || 0,
        infants: searchParams.infants || 0,
        cabin: searchParams.cabin || 'ECONOMY',
        airline: selectedItem.validatingAirlineCodes?.[0],
        flightNumber: firstSegment.number,
        departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(),
        arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(),
        duration: outbound.duration,
        stops: segments.length - 1,
        basePriceUSD: pricing.baseUSD,
        flightDetails: selectedItem,
        quoteNotes: notes,
      };

      const response = await fetch('/api/reservations/flights/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Flight quote request submitted successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit quote request');
      }
    } catch (error) {
      console.error('Submit flight quote error:', error);
      toast.error('Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitHotelQuote = async () => {
    if (!selectedItem) return;

    setSubmitting(true);

    try {
      const hotel = selectedItem.hotel;
      const offer = selectedItem.offers?.[0];

      // Validate required data
      if (!offer || !offer.price || !offer.price.total) {
        console.error('Invalid hotel offer data:', { offer });
        toast.error('Invalid hotel price data. Please try another hotel.');
        setSubmitting(false);
        return;
      }

      const priceTotal = parseFloat(offer.price.total);
      if (isNaN(priceTotal)) {
        console.error('Invalid price value:', offer.price.total);
        toast.error('Invalid price format. Please try another hotel.');
        setSubmitting(false);
        return;
      }

      const pricing = calculatePricing(priceTotal);

      const checkIn = new Date(searchParams.checkInDate);
      const checkOut = new Date(searchParams.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      const quoteData = {
        city: hotel.address?.cityName || searchParams.city || hotel.cityCode || 'Unknown',
        country: hotel.address?.countryCode || searchParams.country,
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children || 0,
        rooms: searchParams.rooms || 1,
        hotelName: hotel.name,
        hotelAddress: hotel.address?.lines?.join(', ') || `${hotel.cityCode || 'N/A'}`,
        roomType: offer.room?.typeEstimated?.category,
        amenities: offer.room?.description || {},
        starRating: hotel.rating,
        basePriceUSD: pricing.baseUSD,
        nights,
        hotelDetails: selectedItem,
        quoteNotes: notes,
      };

      console.log('Submitting hotel quote:', quoteData);

      const response = await fetch('/api/reservations/hotels/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Hotel quote request submitted successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to submit quote request');
      }
    } catch (error) {
      console.error('Submit hotel quote error:', error);
      toast.error('Failed to submit quote request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (type === 'flight') {
      handleSubmitFlightQuote();
    } else {
      handleSubmitHotelQuote();
    }
  };

  if (!selectedItem) return null;

  const pricing = type === 'flight'
    ? calculatePricing(parseFloat(selectedItem.price?.total || 0))
    : calculatePricing(parseFloat(selectedItem.offers?.[0]?.price?.total || 0));

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border-2 border-border shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {type === 'flight' ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Hotel className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Request Quote
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {type === 'flight' ? 'Flight Reservation' : 'Hotel Reservation'}
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
              {/* Selection Summary */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Selection
                </h3>
                
                {type === 'flight' ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium text-foreground">
                        {searchParams.origin} → {searchParams.destination}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Airline:</span>
                      <span className="font-medium text-foreground">
                        {selectedItem.validatingAirlineCodes?.[0] || 'N/A'}
                      </span>
                    </div>
                    {selectedItem.itineraries?.[0]?.segments && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {selectedItem.itineraries[0].segments.length === 1 ? 'Flight Type:' : 'Stops:'}
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedItem.itineraries[0].segments.length === 1 
                            ? 'Direct Flight' 
                            : `${selectedItem.itineraries[0].segments.length - 1} Stop${selectedItem.itineraries[0].segments.length > 2 ? 's' : ''}`}
                        </span>
                      </div>
                    )}
                    {selectedItem.itineraries?.[0]?.segments && selectedItem.itineraries[0].segments.length > 1 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Via:</span>
                        <span className="font-medium text-foreground">
                          {selectedItem.itineraries[0].segments
                            .slice(0, -1)
                            .map((seg: any) => seg.arrival.iataCode)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure:</span>
                      <span className="font-medium text-foreground">
                        {new Date(searchParams.departureDate).toLocaleDateString()}
                      </span>
                    </div>
                    {searchParams.returnDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return:</span>
                        <span className="font-medium text-foreground">
                          {new Date(searchParams.returnDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passengers:</span>
                      <span className="font-medium text-foreground">
                        {searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ) : type === 'hotel' && selectedItem?.hotel ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hotel:</span>
                      <span className="font-medium text-foreground">
                        {selectedItem.hotel.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground">
                        {selectedItem.hotel.address?.cityName || searchParams.city || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium text-foreground">
                        {new Date(searchParams.checkInDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium text-foreground">
                        {new Date(searchParams.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium text-foreground">
                        {searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Price Breakdown</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price (USD):</span>
                    <span className="font-medium text-foreground">
                      ${pricing.baseUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price (GHS):</span>
                    <span className="font-medium text-foreground">
                      GH₵ {pricing.baseGHS.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee (10%):</span>
                    <span className="font-medium text-foreground">
                      GH₵ {pricing.serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        GH₵ {pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
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
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Your quote request will be reviewed by our team</li>
                    <li>We'll confirm pricing and availability</li>
                    <li>You'll receive a payment link via email</li>
                    <li>Complete payment to confirm your booking</li>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Request Quote
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
