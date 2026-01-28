'use client';

import { useState } from 'react';
import { Hotel, MapPin, Star, Wifi, Coffee, Utensils, Users, Calendar, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHotelImageUrl, getHotelGradient } from '@/lib/hotel-images';

interface HotelResultsProps {
  hotels: any[];
  onSelectHotel: (hotel: any) => void;
  exchangeRate: number;
  checkInDate: string;
  checkOutDate: string;
}

export default function HotelResults({ hotels, onSelectHotel, exchangeRate, checkInDate, checkOutDate }: HotelResultsProps) {
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculatePricing = (priceUSD: number) => {
    const baseGHS = priceUSD * exchangeRate;
    const serviceFee = baseGHS * 0.10; // 10% service fee
    const total = baseGHS + serviceFee;
    
    return {
      baseUSD: priceUSD,
      baseGHS,
      serviceFee,
      total,
    };
  };

  const nights = calculateNights();

  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Hotel className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">No hotels found for your search criteria</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your dates or destination</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            Available Hotels ({hotels.length})
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Prices shown in Ghana Cedis (GH₵) include 10% service fee • {nights} night{nights > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotelOffer, index) => {
          const hotel = hotelOffer.hotel;
          const offer = hotelOffer.offers?.[0];
          
          if (!offer) return null;

          const totalPriceUSD = parseFloat(offer.price?.total || 0);
          const pricing = calculatePricing(totalPriceUSD);
          const pricePerNight = pricing.baseGHS / nights;
          const isSelected = selectedHotel === hotelOffer.hotel.hotelId;

          return (
            <motion.div
              key={hotelOffer.hotel.hotelId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => {
                setSelectedHotel(hotelOffer.hotel.hotelId);
                onSelectHotel(hotelOffer);
              }}
              className={`bg-card rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
                isSelected
                  ? 'border-primary shadow-lg scale-[1.02]'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Hotel Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getHotelImageUrl({
                    hotelName: hotel.name,
                    cityName: hotel.address?.cityName,
                    rating: hotel.rating,
                    index: index,
                    // Future-proof: If Amadeus adds images, they'll be used automatically
                    amadeusImageUrl: hotel.media?.[0]?.uri,
                    media: hotel.media,
                  })}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
                {/* Fallback gradient */}
                <div className={`hidden absolute inset-0 ${getHotelGradient(hotel.rating, index)} flex items-center justify-center`}>
                  <Hotel className="w-16 h-16 text-white opacity-50" />
                </div>
                {/* Overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    Selected
                  </div>
                )}
                {/* Hotel Rating Badge */}
                {hotel.rating && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {hotel.rating}
                  </div>
                )}
              </div>

              {/* Hotel Details */}
              <div className="p-5 space-y-4">
                {/* Name & Rating */}
                <div>
                  <h4 className="font-bold text-lg text-foreground line-clamp-2 mb-2">
                    {hotel.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (hotel.rating || 3)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {hotel.rating || 3} Star
                    </span>
                  </div>
                </div>

                {/* Location */}
                {hotel.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <span className="line-clamp-2">
                      {hotel.address.lines?.join(', ') || hotel.address.cityName || 'Location'}
                    </span>
                  </div>
                )}

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {offer.room?.description?.text && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="line-clamp-1">{offer.room.description.text}</span>
                    </div>
                  )}
                </div>

                {/* Room Type */}
                {offer.room?.typeEstimated?.category && (
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Room: </span>
                    <span className="text-muted-foreground">{offer.room.typeEstimated.category}</span>
                  </div>
                )}

                {/* Pricing */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Per Night:</span>
                    <span className="font-medium text-foreground">
                      GH₵ {pricePerNight.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{nights} Night{nights > 1 ? 's' : ''}:</span>
                    <span className="font-medium text-foreground">
                      GH₵ {pricing.baseGHS.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee:</span>
                    <span className="font-medium text-foreground">
                      GH₵ {pricing.serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        GH₵ {pricing.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      ${pricing.baseUSD.toFixed(2)} USD
                    </p>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-foreground border-2 border-border hover:border-primary'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Selected
                    </>
                  ) : (
                    <>
                      Select Hotel
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Info when selected */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p>
                        Click "Request Quote" below to submit for approval.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
