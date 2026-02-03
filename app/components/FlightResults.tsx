'use client';

import { useState } from 'react';
import { Plane, Clock, Users, MapPin, ArrowRight, CheckCircle, Info, Sparkles, Shield, Luggage, Wifi, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAirline } from '@/lib/airlines';

interface FlightResultsProps {
  flights: any[];
  onSelectFlight: (flight: any) => void;
  onConfirm: () => void;
  exchangeRate: number;
}

// SVG Icons for decorative elements
const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TakeoffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
    <path d="M2 22h20" strokeLinecap="round" />
    <path d="M6.36 17.4L4 17l-2-4 1.1-.5c.5-.2 1-.1 1.4.2l1.5 1.1 3.5-1.5L6 6.9c-.2-.4-.1-.9.3-1.1l1-.6c.4-.2.9-.1 1.2.2l5.9 5.2 3.8-1.6c1-.4 2.2 0 2.6 1 .4 1 0 2.2-1 2.6L6.36 17.4z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LandingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
    <path d="M2 22h20" strokeLinecap="round" />
    <path d="M3.77 10.77L2 9l2-4.5 1.1.5c.5.2.7.8.5 1.3L4.5 9l3.5 1.5 3-5.3c.2-.4.7-.6 1.1-.4l1.1.5c.4.2.6.7.4 1.1L10.9 12l3.8 1.6c1 .4 1.5 1.6 1.1 2.6-.4 1-1.6 1.5-2.6 1.1l-9.5-6.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RouteLineIcon = () => (
  <svg viewBox="0 0 120 24" className="w-full h-6" preserveAspectRatio="none">
    <defs>
      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path d="M0 12 Q30 2 60 12 Q90 22 120 12" fill="none" stroke="url(#routeGradient)" strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="0" cy="12" r="4" fill="currentColor" opacity="0.5" />
    <circle cx="120" cy="12" r="4" fill="currentColor" opacity="0.5" />
  </svg>
);

export default function FlightResults({ flights, onSelectFlight, onConfirm, exchangeRate }: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);

  const formatDuration = (duration: string) => {
    const matches = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!matches) return duration;
    const hours = matches[1] ? matches[1].replace('H', 'h ') : '';
    const minutes = matches[2] ? matches[2].replace('M', 'm') : '';
    return (hours + minutes).trim();
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculatePricing = (priceUSD: number) => {
    const baseGHS = priceUSD * exchangeRate;
    const serviceFee = baseGHS * 0.10;
    const total = baseGHS + serviceFee;
    return { baseUSD: priceUSD, baseGHS, serviceFee, total };
  };

  // Empty State
  if (!flights || flights.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-8 sm:p-12">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-blue-500/25">
            <Plane className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-3">No Flights Found</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We couldn't find any flights matching your search criteria. Try adjusting your dates or destinations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: '📅', text: 'Try flexible dates', desc: 'Search within 2-3 months' },
              { icon: '✈️', text: 'Check major hubs', desc: 'ACC, LHR, JFK, DXB' },
              { icon: '🔄', text: 'Add connections', desc: 'Allow 1-2 stops' },
            ].map((tip, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <span className="text-2xl mb-2 block">{tip.icon}</span>
                <p className="font-semibold text-foreground text-sm">{tip.text}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/20 animate-float">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {flights.length} Flight{flights.length > 1 ? 's' : ''} Found
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Prices include all taxes and 10% service fee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Booking</span>
          </div>
        </div>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {flights.map((flight, index) => {
          const pricing = calculatePricing(parseFloat(flight.price.total));
          const outbound = flight.itineraries[0];
          const segments = outbound.segments;
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];
          const isSelected = selectedFlight === flight.id;
          const isExpanded = expandedFlight === flight.id;
          const isDirect = segments.length === 1;

          const airlineCode = flight.validatingAirlineCodes?.[0] || 'XX';
          const airline = getAirline(airlineCode);

          return (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative"
            >
              {/* Best Deal Badge */}
              {index === 0 && (
                <div className="absolute -top-3 left-6 z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Best Deal
                  </div>
                </div>
              )}

              <div
                onClick={() => {
                  setSelectedFlight(flight.id);
                  setExpandedFlight(isExpanded ? null : flight.id);
                  onSelectFlight(flight);
                }}
                className={`relative overflow-hidden bg-card rounded-3xl border-2 transition-all duration-500 cursor-pointer ${isSelected
                  ? 'border-primary shadow-[0_20px_50px_rgba(var(--primary),0.15)] ring-8 ring-primary/5 scale-[1.01]'
                  : 'border-border/60 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1'
                  }`}
              >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />

                <div className="relative p-5 sm:p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-6">

                    {/* Left Section: Airline & Route */}
                    <div className="flex-1 space-y-5">
                      {/* Airline Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center p-2 border border-border shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                              src={airline.logoUrl}
                              alt={airline.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>';
                                }
                              }}
                            />
                          </div>
                          {isDirect && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-card">
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-foreground text-lg">{airline.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{airlineCode}</span>
                            {firstSegment.number && (
                              <>
                                <span className="text-border">•</span>
                                <span>Flight {firstSegment.number}</span>
                              </>
                            )}
                          </div>
                          <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDirect
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                            {isDirect ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Direct Flight
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3" />
                                {segments.length - 1} Stop{segments.length > 2 ? 's' : ''}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Route Display */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-4">
                          {/* Departure */}
                          <div className="text-center min-w-[80px]">
                            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                              <TakeoffIcon />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-foreground">
                              {formatTime(firstSegment.departure.at)}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              {firstSegment.departure.iataCode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(firstSegment.departure.at)}
                            </p>
                          </div>

                          {/* Flight Path */}
                          <div className="flex-1 px-2">
                            <div className="relative">
                              <div className="text-primary">
                                <RouteLineIcon />
                              </div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-card px-3 py-1.5 rounded-full shadow-md border border-border">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-semibold">{formatDuration(outbound.duration)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {!isDirect && (
                              <p className="text-center text-xs text-muted-foreground mt-2">
                                via {segments.slice(0, -1).map((s: any) => s.arrival.iataCode).join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Arrival */}
                          <div className="text-center min-w-[80px]">
                            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                              <LandingIcon />
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold text-foreground">
                              {formatTime(lastSegment.arrival.at)}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              {lastSegment.arrival.iataCode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(lastSegment.arrival.at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{flight.travelerPricings?.length || 1} Passenger{(flight.travelerPricings?.length || 1) > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg text-muted-foreground">
                          <Luggage className="w-3.5 h-3.5" />
                          <span>Baggage Included</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg text-muted-foreground">
                          <Wifi className="w-3.5 h-3.5" />
                          <span>WiFi Available</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Pricing */}
                    <div className="xl:w-64 xl:border-l xl:border-border xl:pl-6">
                      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                        {/* Price Breakdown */}
                        <div className="space-y-2.5 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Base fare</span>
                            <span className="font-medium text-foreground">
                              GH₵ {pricing.baseGHS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Service fee</span>
                            <span className="font-medium text-foreground">
                              GH₵ {pricing.serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="h-px bg-border" />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">Total</span>
                            <div className="text-right">
                              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                GH₵ {pricing.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${pricing.baseUSD.toFixed(2)} USD
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Select Button - Fixed theming */}
                        <button
                          onClick={(e) => {
                            if (isSelected) {
                              e.stopPropagation();
                              onConfirm();
                            }
                          }}
                          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-500 ${isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/40 scale-105'
                            : 'bg-primary/5 hover:bg-primary/10 text-primary border-2 border-primary/10 hover:border-primary/30'
                            }`}
                        >
                          {isSelected ? (
                            <>
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="uppercase tracking-widest text-xs">Confirm & Request Quote</span>
                            </>
                          ) : (
                            <>
                              <span className="uppercase tracking-widest text-xs">Secure this Flight</span>
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-5 pt-5 border-t border-border"
                      >
                        <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-900 dark:text-emerald-50 text-base">You're one step away!</p>
                            <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1 font-medium leading-relaxed">
                              Click the <span className="font-bold underline">Confirm & Request Quote</span> button above or the action button at the bottom to finalize your request.
                            </p>
                          </div>
                        </div>

                        {/* Flight Segments Detail */}
                        {segments.length > 1 && (
                          <div className="mt-4 space-y-3">
                            <p className="font-semibold text-foreground text-sm">Flight Segments</p>
                            {segments.map((segment: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground text-sm">
                                    {segment.departure.iataCode} → {segment.arrival.iataCode}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTime(segment.departure.at)} - {formatTime(segment.arrival.at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Duration</p>
                                  <p className="text-sm font-medium text-foreground">{formatDuration(segment.duration)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Secure Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-500" />
          <span>Price Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-500" />
          <span>24/7 Support</span>
        </div>
      </div>
    </div>
  );
}
