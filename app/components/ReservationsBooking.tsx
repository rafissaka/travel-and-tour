'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, Package, Calendar, MapPin, Users, Loader2, ArrowRight, Search, X, Shield, Clock, CreditCard, Globe, Sparkles, CheckCircle, Star, ArrowLeftRight, ChevronDown, Bed, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import FlightResults from './FlightResults';
import HotelResults from './HotelResults';
import QuoteRequestModal from './QuoteRequestModal';
import PackageQuoteModal from './PackageQuoteModal';
import AirportCitySearch from './AirportCitySearch';
import TravelerSelector from './TravelerSelector';
import StandaloneSearchLoading from './StandaloneSearchLoading';

type BookingType = 'flights' | 'hotels' | 'package';
type PackageStep = 'select_type' | 'select_flight' | 'select_hotel' | 'review';

interface ReservationsBookingProps {
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

// Custom SVG Icons
const PlaneFlightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full opacity-10">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" />
    <ellipse cx="50" cy="50" rx="20" ry="45" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M5 50 H95" stroke="currentColor" strokeWidth="1" />
    <path d="M15 25 Q50 35 85 25" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M15 75 Q50 65 85 75" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="currentColor" opacity="0.1">
    <path d="M80 60H25a25 25 0 0 1-5-49.5 30 30 0 0 1 58 10A20 20 0 0 1 80 60z" />
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

// Styled Input Component
const StyledInput = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  options,
  suffix
}: {
  label: string;
  icon?: any;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  options?: { value: string; label: string }[];
  suffix?: string;
}) => (
  <div className="group">
    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      {label}
      {!required && <span className="text-muted-foreground font-normal text-xs">(Optional)</span>}
    </label>
    <div className="relative">
      {options ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer hover:border-primary/50"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        </div>
      ) : type === 'number' ? (
        <div className="relative flex items-center">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={min}
            max={max}
            required={required}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50"
          />
          {suffix && (
            <span className="absolute right-4 text-sm text-muted-foreground">{suffix}</span>
          )}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50 placeholder:text-muted-foreground"
        />
      )}
    </div>
  </div>
);

export default function ReservationsBooking({ isLoggedIn, onLoginRequired }: ReservationsBookingProps) {
  const [activeTab, setActiveTab] = useState<BookingType>('flights');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(10.93);

  // Package booking state
  const [packageStep, setPackageStep] = useState<PackageStep>('select_type');
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [packageStartsWith, setPackageStartsWith] = useState<'flight' | 'hotel'>('flight');
  const [showPackageQuoteModal, setShowPackageQuoteModal] = useState(false);

  // Flight form state
  const [flightForm, setFlightForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'round-trip' as 'one-way' | 'round-trip',
    adults: 1,
    children: 0,
    infants: 0,
    cabin: 'ECONOMY',
  });

  // Hotel form state
  const [hotelForm, setHotelForm] = useState({
    cityCode: '',
    city: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    rooms: 1,
  });

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
          const data = await response.json();
          if (data.rates?.GHS) {
            setExchangeRate(data.rates.GHS);
          }
        }
      } catch (error) {
        console.log('Using fallback exchange rate');
      }
    };
    fetchExchangeRate();
  }, []);

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(null);

    try {
      const response = await fetch('/api/reservations/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSearchResults(data);
        if (data.flights && data.flights.length > 0) {
          toast.success(`Found ${data.flights.length} flights`);
        } else {
          const message = data.message || 'No flights found for this route';
          toast.info(message, { duration: 5000 });
        }
      } else {
        toast.error(data.error || 'Failed to search flights');
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Failed to search flights');
    } finally {
      setSearching(false);
    }
  };

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(null);

    try {
      const response = await fetch('/api/reservations/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSearchResults(data);
        if (data.cityMapping) {
          toast.info(data.cityMapping.message, { duration: 5000 });
        }
        toast.success(`Found ${data.hotels?.length || 0} hotels`);
      } else {
        toast.error(data.error || 'Failed to search hotels');
      }
    } catch (error) {
      console.error('Hotel search error:', error);
      toast.error('Failed to search hotels');
    } finally {
      setSearching(false);
    }
  };

  const swapLocations = () => {
    setFlightForm({
      ...flightForm,
      origin: flightForm.destination,
      destination: flightForm.origin,
    });
  };

  const totalTravelers = flightForm.adults + flightForm.children + flightForm.infants;
  const totalGuests = hotelForm.adults + hotelForm.children;

  const tabs = [
    { id: 'flights' as BookingType, label: 'Flights', icon: Plane, color: 'from-blue-600 to-cyan-500', bgColor: 'bg-blue-500' },
    { id: 'hotels' as BookingType, label: 'Hotels', icon: Hotel, color: 'from-purple-600 to-pink-500', bgColor: 'bg-purple-500' },
    { id: 'package' as BookingType, label: 'Flight + Hotel', icon: Package, color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500' },
  ];

  const features = [
    { icon: Shield, title: 'Secure Booking', desc: 'Your data is protected' },
    { icon: CreditCard, title: 'Easy Payment', desc: 'Multiple options available' },
    { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
    { icon: Globe, title: 'Global Coverage', desc: 'Flights worldwide' },
  ];

  const cabinOptions = [
    { value: 'ECONOMY', label: '✈️ Economy Class' },
    { value: 'PREMIUM_ECONOMY', label: '💺 Premium Economy' },
    { value: 'BUSINESS', label: '🥂 Business Class' },
    { value: 'FIRST', label: '👑 First Class' },
  ];

  return (
    <div className="space-y-0">
      {/* Standalone Search Loading Screen */}
      <AnimatePresence>
        {searching && <StandaloneSearchLoading />}
      </AnimatePresence>

      {/* Hero Section with Flight Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl mb-8">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 text-white">
            <GlobeIcon />
          </div>

          <div className="absolute top-10 left-10 w-32 h-20 text-white animate-pulse">
            <CloudIcon />
          </div>
          <div className="absolute top-20 right-40 w-24 h-14 text-white animate-pulse" style={{ animationDelay: '1s' }}>
            <CloudIcon />
          </div>
          <div className="absolute bottom-20 left-1/4 w-28 h-16 text-white animate-pulse" style={{ animationDelay: '2s' }}>
            <CloudIcon />
          </div>

          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-50 200 Q200 100 400 150 T800 100"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="2"
              strokeDasharray="10 5"
            />
          </svg>

          <motion.div
            className="absolute w-16 h-16 text-white/80"
            initial={{ x: -100, y: 200 }}
            animate={{
              x: ['-10%', '110%'],
              y: ['60%', '30%', '40%', '20%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <PlaneFlightIcon />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-white/90 text-sm font-medium">Best Prices Guaranteed</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            >
              Discover Your Next
              <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Adventure
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 mb-8 max-w-2xl"
            >
              Search and compare flights, hotels, and vacation packages from hundreds of providers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
                  >
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span className="text-white text-sm font-medium">{feature.title}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <div className="absolute right-0 bottom-0 w-1/3 h-full hidden lg:block">
            <div className="absolute right-10 bottom-10 w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <g transform="translate(20, 40) rotate(-15)">
                  <path
                    d="M140 60 L120 55 L80 75 L30 65 L25 70 L70 90 L60 110 L45 110 L40 120 L60 115 L70 105 L85 130 L95 130 L90 100 L130 80 L140 85 L145 80 L140 60Z"
                    fill="url(#planeGradient)"
                  />
                  <circle cx="95" cy="80" r="3" fill="rgba(59, 130, 246, 0.5)" />
                  <circle cx="105" cy="77" r="3" fill="rgba(59, 130, 246, 0.5)" />
                  <circle cx="115" cy="74" r="3" fill="rgba(59, 130, 246, 0.5)" />
                </g>
                <path d="M50 130 Q80 140 110 130 T170 140" stroke="white" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selection - Modern Style */}
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-2 mb-8 shadow-2xl relative z-10 mx-auto max-w-2xl">
        <div className="flex flex-row gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchResults(null);
                  setSelectedItem(null);
                }}
                className={`flex-1 relative flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-500 overflow-hidden ${isActive
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-lg shadow-blue-500/20`}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-sm tracking-tight">{tab.label}</span>
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -right-1 -top-1 w-3 h-3 bg-white/40 rounded-full blur-sm"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Exchange Rate Badge */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-background/95 backdrop-blur-xl border border-border rounded-full shadow-lg text-[10px] font-bold text-muted-foreground whitespace-nowrap z-20">
          <Globe className="w-3 h-3 text-emerald-500" />
          <span>Live Rate: 1 USD = GH₵ {exchangeRate.toFixed(2)}</span>
        </div>
      </div>

      {/* Search Forms */}
      <AnimatePresence mode="wait">
        {activeTab === 'flights' && (
          <motion.div
            key="flights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-card rounded-[2rem] border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-20">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-8 py-8 relative overflow-hidden rounded-t-[2rem]">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
                  </svg>
                </div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <motion.div
                      initial={{ rotate: -15, scale: 0.8 }}
                      animate={{ rotate: 0, scale: 1 }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner"
                    >
                      <Plane className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">Search Flights</h3>
                      <p className="text-white/80 font-medium">Global destinations, local prices (GH₵)</p>
                    </div>
                  </div>

                  {/* Trip Type Toggle */}
                  <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFlightForm({ ...flightForm, tripType: 'round-trip' })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${flightForm.tripType === 'round-trip' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-white/5'}`}
                    >
                      Round Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlightForm({ ...flightForm, tripType: 'one-way' })}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${flightForm.tripType === 'one-way' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-white/5'}`}
                    >
                      One Way
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleFlightSearch} className="p-6 space-y-6">
                {/* Route Selection - Special Design */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* From */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <TakeoffIcon />
                        </div>
                      </div>
                      <div className="pl-16">
                        <AirportCitySearch
                          value={flightForm.origin}
                          onChange={(code) => setFlightForm({ ...flightForm, origin: code })}
                          label="From"
                          placeholder="Search departure city..."
                          type="airport"
                        />
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex">
                      <button
                        type="button"
                        onClick={swapLocations}
                        className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all group"
                      >
                        <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                      </button>
                    </div>

                    {/* To */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <LandingIcon />
                        </div>
                      </div>
                      <div className="pl-16">
                        <AirportCitySearch
                          value={flightForm.destination}
                          onChange={(code) => setFlightForm({ ...flightForm, destination: code })}
                          label="To"
                          placeholder="Search destination city..."
                          type="airport"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Swap Button */}
                  <div className="flex justify-center md:hidden mt-2">
                    <button
                      type="button"
                      onClick={swapLocations}
                      className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all flex items-center gap-2 text-sm"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      Swap locations
                    </button>
                  </div>
                </div>

                {/* Dates Row */}
                <div className={`grid grid-cols-1 ${flightForm.tripType === 'round-trip' ? 'sm:grid-cols-2' : ''} gap-4`}>
                  <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={flightForm.departureDate}
                      onChange={(e) => setFlightForm({ ...flightForm, departureDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50"
                    />
                  </div>

                  {flightForm.tripType === 'round-trip' && (
                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={flightForm.returnDate}
                        onChange={(e) => setFlightForm({ ...flightForm, returnDate: e.target.value })}
                        min={flightForm.departureDate || new Date().toISOString().split('T')[0]}
                        required={flightForm.tripType === 'round-trip'}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50"
                      />
                    </div>
                  )}
                </div>

                {/* Travelers & Class Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Travelers Dropdown */}
                  <TravelerSelector
                    adults={flightForm.adults}
                    children={flightForm.children}
                    infants={flightForm.infants}
                    onAdultsChange={(value) => setFlightForm({ ...flightForm, adults: value })}
                    onChildrenChange={(value) => setFlightForm({ ...flightForm, children: value })}
                    onInfantsChange={(value) => setFlightForm({ ...flightForm, infants: value })}
                    showChildren={true}
                    showInfants={true}
                    label="Travelers"
                    icon={Users}
                  />

                  {/* Cabin Class */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Cabin Class
                    </label>
                    <div className="relative">
                      <select
                        value={flightForm.cabin}
                        onChange={(e) => setFlightForm({ ...flightForm, cabin: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50 appearance-none cursor-pointer"
                      >
                        {cabinOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Searching Flights...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Search Flights
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'hotels' && (
          <motion.div
            key="hotels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-card rounded-[2rem] border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-20">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 px-8 py-8 relative overflow-hidden rounded-t-[2rem]">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="100" cy="0" r="50" fill="currentColor" />
                  </svg>
                </div>

                <div className="relative flex items-center gap-6">
                  <motion.div
                    initial={{ rotate: 15, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner"
                  >
                    <Hotel className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Search Hotels</h3>
                    <p className="text-white/80 font-medium">World-class stays at your fingertips</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleHotelSearch} className="p-6 space-y-6">
                {/* Destination */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 mt-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="pl-16">
                    <AirportCitySearch
                      value={hotelForm.cityCode}
                      onChange={(code, city) => setHotelForm({ ...hotelForm, cityCode: code, city: city || code })}
                      label="Destination"
                      placeholder="Where are you going?"
                      type="city"
                    />
                  </div>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={hotelForm.checkInDate}
                      onChange={(e) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={hotelForm.checkOutDate}
                      onChange={(e) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                      min={hotelForm.checkInDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50"
                    />
                  </div>
                </div>

                {/* Guests & Rooms Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guests Dropdown */}
                  <TravelerSelector
                    adults={hotelForm.adults}
                    children={hotelForm.children}
                    onAdultsChange={(value) => setHotelForm({ ...hotelForm, adults: value })}
                    onChildrenChange={(value) => setHotelForm({ ...hotelForm, children: value })}
                    showChildren={true}
                    showInfants={false}
                    label="Guests"
                    icon={Users}
                  />

                  {/* Rooms */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Bed className="w-4 h-4 text-primary" />
                      Rooms
                    </label>
                    <div className="relative">
                      <select
                        value={hotelForm.rooms}
                        onChange={(e) => setHotelForm({ ...hotelForm, rooms: parseInt(e.target.value) })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/50 appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Searching Hotels...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Search Hotels
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'package' && (
          <motion.div
            key="package"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Choose starting point */}
            {packageStep === 'select_type' && (
              <div className="bg-card rounded-2xl border border-border shadow-lg">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8 text-center rounded-t-2xl relative overflow-hidden">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Flight + Hotel Package
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">
                      Save 5% when you book together!
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <p className="text-center text-muted-foreground mb-8 text-lg">
                    Book your flight and hotel together for the best savings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <button
                      onClick={() => {
                        setPackageStartsWith('flight');
                        setPackageStep('select_flight');
                      }}
                      className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-8 border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-xl text-left overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                          <Plane className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-2">Start with Flight</h4>
                        <p className="text-sm text-muted-foreground">
                          Search for flights first, then find hotels at your destination
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPackageStartsWith('hotel');
                        setPackageStep('select_hotel');
                      }}
                      className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-8 border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-xl text-left overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                          <Hotel className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground mb-2">Start with Hotel</h4>
                        <p className="text-sm text-muted-foreground">
                          Pick your hotel first, then find flights to get you there
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="text-center mt-8">
                    <button
                      onClick={() => setActiveTab('flights')}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      ← Back to regular booking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Package Flight Search - Reuse flight form design */}
            {packageStep === 'select_flight' && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Step 1: Select Your Flight</p>
                      <p className="text-sm text-muted-foreground">Next: Choose hotel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPackageStep('select_type');
                      setSearchResults(null);
                      setSelectedFlight(null);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>

                {!searchResults ? (
                  <div className="bg-card rounded-2xl border border-border shadow-lg relative z-20">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 rounded-t-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Plane className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Package Flight</h3>
                          <p className="text-sm text-white/80">Search flights for your package</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleFlightSearch} className="p-6 space-y-6">
                      {/* Route Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AirportCitySearch
                          value={flightForm.origin}
                          onChange={(code) => setFlightForm({ ...flightForm, origin: code })}
                          label="From"
                          placeholder="Departure city..."
                          type="airport"
                        />
                        <AirportCitySearch
                          value={flightForm.destination}
                          onChange={(code) => setFlightForm({ ...flightForm, destination: code })}
                          label="To"
                          placeholder="Destination..."
                          type="airport"
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StyledInput
                          label="Departure Date"
                          icon={Calendar}
                          type="date"
                          value={flightForm.departureDate}
                          onChange={(value) => setFlightForm({ ...flightForm, departureDate: value })}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <StyledInput
                          label="Return Date"
                          icon={Calendar}
                          type="date"
                          value={flightForm.returnDate}
                          onChange={(value) => setFlightForm({ ...flightForm, returnDate: value })}
                          min={flightForm.departureDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Travelers & Class */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TravelerSelector
                          adults={flightForm.adults}
                          children={flightForm.children}
                          infants={flightForm.infants}
                          onAdultsChange={(value) => setFlightForm({ ...flightForm, adults: value })}
                          onChildrenChange={(value) => setFlightForm({ ...flightForm, children: value })}
                          onInfantsChange={(value) => setFlightForm({ ...flightForm, infants: value })}
                          showChildren={true}
                          showInfants={true}
                        />
                        <StyledInput
                          label="Cabin Class"
                          icon={Briefcase}
                          value={flightForm.cabin}
                          onChange={(value) => setFlightForm({ ...flightForm, cabin: value })}
                          options={cabinOptions}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={searching}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg"
                      >
                        {searching ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="w-6 h-6" />
                            Search Flights
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <FlightResults
                      flights={searchResults.flights || []}
                      onSelectFlight={(flight) => {
                        setSelectedFlight(flight);
                        setSelectedItem(flight);
                      }}
                      onConfirm={() => {
                        setPackageStep('select_hotel');
                        setSearchResults(null);
                        setSelectedItem(null);
                      }}
                      exchangeRate={exchangeRate}
                    />

                    {selectedFlight && (
                      <div className="sticky bottom-6 flex justify-center">
                        <button
                          onClick={() => {
                            const arrivalDate = new Date(flightForm.departureDate);
                            const departureDate = flightForm.returnDate
                              ? new Date(flightForm.returnDate)
                              : new Date(arrivalDate.getTime() + 3 * 24 * 60 * 60 * 1000);

                            setHotelForm({
                              ...hotelForm,
                              cityCode: flightForm.destination,
                              checkInDate: arrivalDate.toISOString().split('T')[0],
                              checkOutDate: departureDate.toISOString().split('T')[0],
                              adults: flightForm.adults,
                            });
                            setPackageStep('select_hotel');
                            setSearchResults(null);
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-2xl transition-all flex items-center gap-3 text-lg"
                        >
                          Continue to Hotels
                          <ArrowRight className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Package Hotel Search */}
            {packageStep === 'select_hotel' && (
              <div className="space-y-6">
                {/* Progress */}
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-4">
                  {packageStartsWith === 'flight' && selectedFlight && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-orange-200 dark:border-orange-800">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">Flight Selected!</p>
                        <p className="text-sm text-muted-foreground">{flightForm.origin} → {flightForm.destination}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                        {packageStartsWith === 'flight' ? '2' : '1'}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Select Your Hotel</p>
                        <p className="text-sm text-muted-foreground">Find accommodation</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPackageStep(packageStartsWith === 'flight' ? 'select_flight' : 'select_type');
                        setSearchResults(null);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                {!searchResults ? (
                  <div className="bg-card rounded-2xl border border-border shadow-lg relative z-20">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-5 rounded-t-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Hotel className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Package Hotel</h3>
                          <p className="text-sm text-white/80">Search hotels for your package</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleHotelSearch} className="p-6 space-y-6">
                      <AirportCitySearch
                        value={hotelForm.cityCode}
                        onChange={(code, city) => setHotelForm({ ...hotelForm, cityCode: code, city: city || code })}
                        label="Destination"
                        placeholder="Where are you staying?"
                        type="city"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StyledInput
                          label="Check-in"
                          icon={Calendar}
                          type="date"
                          value={hotelForm.checkInDate}
                          onChange={(value) => setHotelForm({ ...hotelForm, checkInDate: value })}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <StyledInput
                          label="Check-out"
                          icon={Calendar}
                          type="date"
                          value={hotelForm.checkOutDate}
                          onChange={(value) => setHotelForm({ ...hotelForm, checkOutDate: value })}
                          required
                          min={hotelForm.checkInDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TravelerSelector
                          adults={hotelForm.adults}
                          children={hotelForm.children}
                          onAdultsChange={(value) => setHotelForm({ ...hotelForm, adults: value })}
                          onChildrenChange={(value) => setHotelForm({ ...hotelForm, children: value })}
                          showChildren={true}
                          showInfants={false}
                          label="Guests"
                          icon={Users}
                        />
                        <StyledInput
                          label="Rooms"
                          icon={Bed}
                          value={hotelForm.rooms}
                          onChange={(value) => setHotelForm({ ...hotelForm, rooms: parseInt(value) })}
                          options={[1, 2, 3, 4, 5].map(n => ({ value: String(n), label: `${n} Room${n > 1 ? 's' : ''}` }))}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={searching}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg"
                      >
                        {searching ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="w-6 h-6" />
                            Search Hotels
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <HotelResults
                      hotels={searchResults.hotels || []}
                      onSelectHotel={(hotel) => {
                        setSelectedHotel(hotel);
                        setSelectedItem(hotel);
                      }}
                      onConfirm={() => setPackageStep('review')}
                      exchangeRate={exchangeRate}
                      checkInDate={hotelForm.checkInDate}
                      checkOutDate={hotelForm.checkOutDate}
                    />

                    {selectedHotel && (
                      <div className="sticky bottom-6 flex justify-center">
                        <button
                          onClick={() => setPackageStep('review')}
                          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl shadow-2xl transition-all flex items-center gap-3 text-lg"
                        >
                          Review Package
                          <ArrowRight className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Package Review */}
            {packageStep === 'review' && selectedFlight && selectedHotel && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl mb-4 shadow-lg">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Your Package</h3>
                  <p className="text-muted-foreground">Review and get 5% discount!</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Flight Summary */}
                  <div className="bg-card rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-5 py-4 border-b border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Plane className="w-5 h-5 text-blue-600" />
                        Flight
                      </h4>
                    </div>
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">{flightForm.origin} → {flightForm.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-blue-600">
                          GH₵ {(parseFloat(selectedFlight.price.total) * exchangeRate * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Summary */}
                  <div className="bg-card rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-5 py-4 border-b border-purple-200 dark:border-purple-800">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Hotel className="w-5 h-5 text-purple-600" />
                        Hotel
                      </h4>
                    </div>
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hotel:</span>
                        <span className="font-medium line-clamp-1">{selectedHotel.hotel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-bold text-purple-600">
                          GH₵ {(parseFloat(selectedHotel.offers[0].price.total) * exchangeRate * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                  {(() => {
                    const flightTotal = parseFloat(selectedFlight.price.total) * exchangeRate * 1.1;
                    const hotelTotal = parseFloat(selectedHotel.offers[0].price.total) * exchangeRate * 1.1;
                    const subtotal = flightTotal + hotelTotal;
                    const discount = subtotal * 0.05;
                    const total = subtotal - discount;

                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Flight:</span>
                          <span className="font-medium">GH₵ {flightTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Hotel:</span>
                          <span className="font-medium">GH₵ {hotelTotal.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between text-sm text-emerald-600">
                          <span className="flex items-center gap-1 font-semibold">
                            <Sparkles className="w-4 h-4" />
                            Package Discount (5%):
                          </span>
                          <span className="font-bold">-GH₵ {discount.toFixed(2)}</span>
                        </div>
                        <div className="border-t-2 border-border pt-3 flex justify-between items-center">
                          <span className="font-bold text-foreground text-lg">Total:</span>
                          <span className="text-3xl font-bold text-orange-600">GH₵ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setPackageStep('select_hotel');
                      setSelectedHotel(null);
                      setSearchResults(null);
                    }}
                    className="flex-1 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                  >
                    ← Change Hotel
                  </button>
                  <button
                    onClick={() => setShowPackageQuoteModal(true)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg transition-all"
                  >
                    Request Quote
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      {searchResults && activeTab !== 'package' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 mt-6"
        >
          {activeTab === 'flights' && searchResults.flights && (
            <FlightResults
              flights={searchResults.flights}
              onSelectFlight={setSelectedItem}
              onConfirm={() => isLoggedIn ? setShowQuoteModal(true) : onLoginRequired()}
              exchangeRate={exchangeRate}
            />
          )}

          {activeTab === 'hotels' && searchResults.hotels && (
            <HotelResults
              hotels={searchResults.hotels}
              onSelectHotel={setSelectedItem}
              onConfirm={() => isLoggedIn ? setShowQuoteModal(true) : onLoginRequired()}
              exchangeRate={exchangeRate}
              checkInDate={hotelForm.checkInDate}
              checkOutDate={hotelForm.checkOutDate}
            />
          )}

          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky bottom-6 flex justify-center"
            >
              <button
                onClick={() => isLoggedIn ? setShowQuoteModal(true) : onLoginRequired()}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl shadow-2xl transition-all flex items-center gap-3 text-lg"
              >
                <ArrowRight className="w-6 h-6" />
                {isLoggedIn ? `Request Quote` : 'Login to Book'}
              </button>
            </motion.div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setSearchResults(null);
                setSelectedItem(null);
              }}
              className="px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              New Search
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        type={activeTab === 'flights' ? 'flight' : 'hotel'}
        selectedItem={selectedItem}
        searchParams={activeTab === 'flights' ? flightForm : hotelForm}
        exchangeRate={exchangeRate}
        onSuccess={() => {
          setSearchResults(null);
          setSelectedItem(null);
          setShowQuoteModal(false);
        }}
      />

      <PackageQuoteModal
        isOpen={showPackageQuoteModal}
        onClose={() => setShowPackageQuoteModal(false)}
        selectedFlight={selectedFlight}
        selectedHotel={selectedHotel}
        flightForm={flightForm}
        hotelForm={hotelForm}
        exchangeRate={exchangeRate}
        onSuccess={() => {
          setPackageStep('select_type');
          setSelectedFlight(null);
          setSelectedHotel(null);
          setSearchResults(null);
          setShowPackageQuoteModal(false);
          setActiveTab('flights');
        }}
      />
    </div>
  );
}
