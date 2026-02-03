'use client';

import { useState } from 'react';
import { Hotel, Star, MapPin, CheckCircle, Info, Wifi, Sparkles, Shield, Coffee, Bed, Bath, ArrowRight, Calendar, Users, Waves, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotelResultsProps {
  hotels: any[];
  onSelectHotel: (hotel: any) => void;
  onConfirm: () => void;
  exchangeRate: number;
  checkInDate: string;
  checkOutDate: string;
}

const RatingStars = ({ rating }: { rating: string | number }) => {
  const count = parseInt(String(rating)) || 3;
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
    </div>
  );
};

export default function HotelResults({
  hotels,
  onSelectHotel,
  onConfirm,
  exchangeRate,
  checkInDate,
  checkOutDate
}: HotelResultsProps) {
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const calculatePricing = (priceUSD: number) => {
    const baseGHS = priceUSD * exchangeRate;
    const serviceFee = baseGHS * 0.10;
    const total = baseGHS + serviceFee;
    return { baseUSD: priceUSD, baseGHS, serviceFee, total };
  };

  const calculateNights = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  if (!hotels || hotels.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg shadow-purple-500/25">
            <Hotel className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Hotels Found</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We couldn't find any hotels matching your search criteria in this area. Try adjusting your dates or city.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/20">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {hotels.length} Hotel{hotels.length > 1 ? 's' : ''} Available
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {nights} night{nights > 1 ? 's' : ''} stay • {new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Premium Stays</span>
          </div>
        </div>
      </div>

      {/* Hotel Cards */}
      <div className="grid grid-cols-1 gap-6">
        {hotels.map((hotelOffer, index) => {
          const hotel = hotelOffer.hotel;
          const offer = hotelOffer.offers[0];
          const pricing = calculatePricing(parseFloat(offer.price.total));
          const isSelected = selectedHotelId === hotel.hotelId;

          // Placeholder amenities if none provided
          const amenities = [
            { icon: Wifi, label: 'Free WiFi' },
            { icon: Coffee, label: 'Breakfast' },
            { icon: Bath, label: 'Private Bath' },
          ];

          return (
            <motion.div
              key={hotel.hotelId || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative"
            >
              {index === 0 && (
                <div className="absolute -top-3 left-6 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended
                  </div>
                </div>
              )}

              <div
                onClick={() => {
                  setSelectedHotelId(hotel.hotelId);
                  onSelectHotel(hotelOffer);
                }}
                className={`relative overflow-hidden bg-card rounded-3xl border-2 transition-all duration-500 cursor-pointer ${isSelected
                  ? 'border-primary shadow-[0_20px_50px_rgba(var(--primary),0.15)] ring-8 ring-primary/5 scale-[1.01]'
                  : 'border-border/60 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1'
                  }`}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Hotel Image Placeholder */}
                  <div className="lg:w-72 h-48 lg:h-auto bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Hotel className="w-12 h-12 text-slate-400 opacity-20" />
                    </div>
                    {/* Simulated image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <RatingStars rating={hotel.rating || 4} />
                    </div>
                  </div>

                  <div className="flex-1 p-6 relative">
                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {hotel.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{hotel.address?.cityName || 'City Center'}</span>
                            {hotel.distance && (
                              <>
                                <span className="text-border">•</span>
                                <span>{hotel.distance.value} {hotel.distance.unit} from center</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Description/Features */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {amenities.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded-lg border border-border/50">
                              <item.icon className="w-3.5 h-3.5 text-primary" />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Offers Info */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                            <Bed className="w-4 h-4" />
                            <span>{offer.room?.typeEstimated?.category || 'Standard Room'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {offer.room?.description?.text || 'Enjoy a comfortable stay with modern amenities and excellent service.'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="xl:w-64 xl:border-l xl:border-border xl:pl-6">
                        <div className="bg-muted/30 rounded-2xl p-4 border border-border">
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Price per night</span>
                              <span className="font-medium text-foreground">
                                GH₵ {(pricing.baseGHS / nights).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{nights} nights total</span>
                              <span className="font-medium text-foreground">
                                GH₵ {pricing.baseGHS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <span>Service fee (10%)</span>
                              <span>+GH₵ {pricing.serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="text-right">
                              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                                GH₵ {pricing.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">Total for {nights} nights</p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              if (isSelected) {
                                e.stopPropagation();
                                onConfirm();
                              }
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${isSelected
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                              }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Confirm Choice</span>
                              </>
                            ) : (
                              <>
                                <span>Select Hotel</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Excellent choice!</p>
                            <p className="text-xs text-muted-foreground">Finalize your booking by clicking Confirm above.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {[
          { icon: Shield, text: 'Instant Confirmation', color: 'text-emerald-500' },
          { icon: Coffee, text: 'Breakfast Included', color: 'text-amber-500' },
          { icon: Calendar, text: 'Flexible Cancellation', color: 'text-blue-500' }
        ].map((benefit, i) => (
          <div key={i} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
            <span>{benefit.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}