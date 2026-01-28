'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Users, Check, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ItineraryPlanningFormProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
}

// Fixed consultation fee for itinerary planning
const ITINERARY_CONSULTATION_FEE = 500; // GHS per traveler

interface Traveler {
  name: string;
  age: string;
  type: string;
}

export default function ItineraryPlanningForm({ serviceId, serviceTitle, onClose }: ItineraryPlanningFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    contactFullName: '',
    contactEmail: '',
    contactPhone: '',
    destination: '',
    travelStartDate: '',
    travelEndDate: '',
    tripDuration: '',
    travelers: [{ name: '', age: '', type: 'Adult' }] as Traveler[],
    tripType: [] as string[],
    accommodationType: '',
    transportPreference: [] as string[],
    interests: [] as string[],
    mustVisit: '',
    avoidPreferences: '',
    dietaryRestrictions: [] as string[],
    mobilityRequirements: '',
    specialRequests: '',
    budgetRange: '',
    budgetIncludes: [] as string[],
    pacingPreference: 'Moderate',
    planningLevel: 'Daily overview',
    needsReservations: false,
    previousExperience: '',
    additionalNotes: '',
    referralSource: 'Website',
  });

  const tripTypes = ['Adventure', 'Relaxation', 'Cultural', 'Business', 'Romantic', 'Family Fun', 'Wellness', 'Foodie'];
  const accommodationTypes = ['Luxury Hotel', 'Mid-range Hotel', 'Budget Hotel', 'Boutique Hotel', 'Airbnb/Vacation Rental', 'Hostel', 'Resort'];
  const transportOptions = ['Flights', 'Trains', 'Car Rental', 'Private Driver', 'Public Transport', 'Bike'];
  const interestOptions = ['Museums', 'Beaches', 'Nightlife', 'Food Tours', 'Shopping', 'Nature/Hiking', 'Historical Sites', 'Photography'];
  const budgetRanges = ['Budget ($)', 'Mid-range ($$)', 'Luxury ($$$)', 'Ultra Luxury ($$$$)'];
  const pacingOptions = ['Relaxed', 'Moderate', 'Packed'];
  const planningLevels = ['Flexible suggestions', 'Daily overview', 'Detailed hour-by-hour'];

  const addTraveler = () => {
    setFormData({ ...formData, travelers: [...formData.travelers, { name: '', age: '', type: 'Adult' }] });
  };

  const removeTraveler = (index: number) => {
    if (formData.travelers.length > 1) {
      setFormData({ ...formData, travelers: formData.travelers.filter((_, i) => i !== index) });
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const newTravelers = [...formData.travelers];
    newTravelers[index][field] = value;
    setFormData({ ...formData, travelers: newTravelers });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  // Calculate total consultation fee based on travelers
  const calculateFee = () => {
    return formData.travelers.length * ITINERARY_CONSULTATION_FEE;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.contactFullName || !formData.contactEmail || !formData.contactPhone) {
          toast.error('Please fill in all contact information');
          return false;
        }
        return true;
      case 2:
        if (!formData.destination || !formData.travelStartDate || !formData.travelEndDate) {
          toast.error('Please fill in trip details');
          return false;
        }
        return true;
      case 3:
        if (formData.travelers.some(t => !t.name || !t.age)) {
          toast.error('Please complete traveler information');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Check if user is logged in first
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        toast.info('Please log in to submit your itinerary request');
        onClose();
        router.push('/auth/login?redirect=/services/itinerary');
        return;
      }

      // Calculate trip duration
      const start = new Date(formData.travelStartDate);
      const end = new Date(formData.travelEndDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const tripDuration = `${days} day${days > 1 ? 's' : ''}`;

      // Step 1: Create the booking with fee estimate
      const feeEstimate = calculateFee(); // GHS 500 per traveler

      const bookingResponse = await fetch('/api/itinerary-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, ...formData, tripDuration, feeEstimate }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.error || 'Failed to submit booking');
      }

      const booking = await bookingResponse.json();

      toast.success('Itinerary request submitted successfully!');
      
      // Step 2: Initialize payment
      const paymentResponse = await fetch('/api/itinerary-bookings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itineraryId: booking.id,
        }),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        // If payment init fails, still show success but inform user
        toast.error(error.error || 'Payment initialization failed. Please contact support.');
        onClose();
        router.push('/profile/bookings');
        return;
      }

      const paymentData = await paymentResponse.json();
      
      // Step 3: Redirect to Paystack payment page
      if (paymentData.authorization_url) {
        toast.info('Redirecting to payment...');
        onClose();
        // Small delay to ensure toast is visible
        setTimeout(() => {
          window.location.href = paymentData.authorization_url;
        }, 500);
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error: any) {
      console.error('Error submitting itinerary booking:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Contact', icon: User },
    { number: 2, title: 'Trip Details', icon: MapPin },
    { number: 3, title: 'Travelers', icon: Users },
    { number: 4, title: 'Preferences', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep >= step.number ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {currentStep > step.number ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className="text-xs mt-2 text-center font-medium hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded transition-all ${currentStep > step.number ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          
          {/* Step 1: Contact */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" />Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={formData.contactFullName} onChange={(e) => setFormData({ ...formData, contactFullName: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full Name *" />
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Email *" />
                <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Phone *" />
              </div>
            </div>
          )}

          {/* Step 2: Trip Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Trip Details</h3>
              <input type="text" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Destination(s) *" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input type="date" value={formData.travelStartDate} onChange={(e) => setFormData({ ...formData, travelStartDate: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input type="date" value={formData.travelEndDate} onChange={(e) => setFormData({ ...formData, travelEndDate: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trip Type (Select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tripTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 p-3 border-2 border-border rounded-lg hover:bg-muted cursor-pointer">
                      <input type="checkbox" checked={formData.tripType.includes(type)}
                        onChange={() => setFormData({ ...formData, tripType: toggleArrayItem(formData.tripType, type) })} className="w-4 h-4" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Travelers */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Travelers</h3>
                <button onClick={addTraveler} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Add Traveler
                </button>
              </div>
              {formData.travelers.map((traveler, index) => (
                <div key={index} className="p-4 border-2 border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Traveler {index + 1}</h4>
                    {formData.travelers.length > 1 && (
                      <button onClick={() => removeTraveler(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" value={traveler.name} onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Name *" />
                    <input type="number" value={traveler.age} onChange={(e) => updateTraveler(index, 'age', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Age *" />
                    <select value={traveler.type} onChange={(e) => updateTraveler(index, 'type', e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Trip Preferences</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Accommodation Type</label>
                <select value={formData.accommodationType} onChange={(e) => setFormData({ ...formData, accommodationType: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select accommodation</option>
                  {accommodationTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget Range</label>
                <select value={formData.budgetRange} onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select budget</option>
                  {budgetRanges.map(range => <option key={range} value={range}>{range}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trip Pacing</label>
                <div className="grid grid-cols-3 gap-3">
                  {pacingOptions.map(pacing => (
                    <label key={pacing} className={`p-3 border-2 rounded-lg cursor-pointer text-center ${formData.pacingPreference === pacing ? 'border-primary bg-primary/10' : 'border-border'}`}>
                      <input type="radio" name="pacing" value={pacing} checked={formData.pacingPreference === pacing}
                        onChange={(e) => setFormData({ ...formData, pacingPreference: e.target.value })} className="sr-only" />
                      <span className="text-sm font-medium">{pacing}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Planning Level</label>
                <select value={formData.planningLevel} onChange={(e) => setFormData({ ...formData, planningLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  {planningLevels.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4} placeholder="Additional notes or special requests..." />
              
              {/* Fee Display */}
              <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Total Travelers:</span>
                  <span className="text-lg text-foreground">{formData.travelers.length}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Fee per Traveler:</span>
                  <span className="text-lg text-foreground">GHS {ITINERARY_CONSULTATION_FEE}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-primary/30">
                  <span className="text-xl font-bold text-foreground">Consultation Fee:</span>
                  <span className="text-3xl font-bold text-primary">GHS {calculateFee()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  This fee covers our itinerary planning consultation and personalized travel plan.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <button onClick={currentStep === 1 ? onClose : handleBack}
          className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />{currentStep === 1 ? 'Cancel' : 'Back'}
        </button>
        {currentStep < 4 ? (
          <button onClick={handleNext} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
            Next<ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit & Pay GHS {calculateFee()}
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
