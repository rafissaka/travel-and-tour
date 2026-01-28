'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Traveler {
  name: string;
  age: string;
  type: string;
  nationality: string;
  specialNeeds: string;
}

interface ConsultationFormProps {
  serviceId: string;
  serviceTitle: string;
  onClose?: () => void;
}

export default function ConsultationForm({ serviceId, serviceTitle, onClose }: ConsultationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Section 1: Contact & Travelers
  const [contactFullName, setContactFullName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactResidence, setContactResidence] = useState('');
  
  const [travelers, setTravelers] = useState<Traveler[]>([
    { name: '', age: '', type: '', nationality: '', specialNeeds: '' }
  ]);
  const [feeAcknowledged, setFeeAcknowledged] = useState(false);

  // Section 2: Trip Specifics
  const [destinationClarity, setDestinationClarity] = useState('');
  const [destinationDetails, setDestinationDetails] = useState('');
  const [travelStartDate, setTravelStartDate] = useState('');
  const [travelEndDate, setTravelEndDate] = useState('');
  const [tripDuration, setTripDuration] = useState('');
  const [tripType, setTripType] = useState<string[]>([]);
  const [mustDoActivities, setMustDoActivities] = useState('');
  const [accommodationStyle, setAccommodationStyle] = useState('');

  // Section 3: Logistics
  const [transportMethod, setTransportMethod] = useState<string[]>([]);
  const [carSeatNeeds, setCarSeatNeeds] = useState<string[]>([]);
  const [driverRequirement, setDriverRequirement] = useState('');
  const [yellowFever, setYellowFever] = useState('');
  const [malariaPlan, setMalariaPlan] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState('');
  const [spendingStyle, setSpendingStyle] = useState('');

  // Section 4: Submission
  const [referralSource, setReferralSource] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // Calculate fee
  const calculateFee = () => {
    let total = 0;
    travelers.forEach(traveler => {
      if (traveler.type === 'Infant (0-1)') {
        total += 250;
      } else if (traveler.type) {
        total += 500;
      }
    });
    return total;
  };

  const addTraveler = () => {
    setTravelers([...travelers, { name: '', age: '', type: '', nationality: '', specialNeeds: '' }]);
  };

  const removeTraveler = (index: number) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter((_, i) => i !== index));
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  const toggleTripType = (type: string) => {
    if (tripType.includes(type)) {
      setTripType(tripType.filter(t => t !== type));
    } else if (tripType.length < 3) {
      setTripType([...tripType, type]);
    } else {
      toast.error('Maximum 3 trip types allowed');
    }
  };

  const toggleTransportMethod = (method: string) => {
    if (transportMethod.includes(method)) {
      setTransportMethod(transportMethod.filter(m => m !== method));
    } else {
      setTransportMethod([...transportMethod, method]);
    }
  };

  const toggleCarSeat = (seat: string) => {
    if (carSeatNeeds.includes(seat)) {
      setCarSeatNeeds(carSeatNeeds.filter(s => s !== seat));
    } else {
      setCarSeatNeeds([...carSeatNeeds, seat]);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  const validateStep1 = () => {
    if (!contactFullName || !contactEmail || !contactPhone || !contactResidence) {
      toast.error('Please fill all contact information');
      return false;
    }
    if (travelers.some(t => !t.name || !t.age || !t.type || !t.nationality)) {
      toast.error('Please complete all traveler information');
      return false;
    }
    if (!feeAcknowledged) {
      toast.error('Please acknowledge the consultation fee');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!destinationClarity || !travelStartDate || !travelEndDate || !tripDuration) {
      toast.error('Please fill all required trip details');
      return false;
    }
    if (tripType.length === 0) {
      toast.error('Please select at least one trip type');
      return false;
    }
    if (!mustDoActivities || !accommodationStyle) {
      toast.error('Please fill all required trip preferences');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (transportMethod.length === 0) {
      toast.error('Please select at least one transport method');
      return false;
    }
    if (!yellowFever || !malariaPlan || !totalBudget || !spendingStyle) {
      toast.error('Please fill all required logistics information');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!referralSource) {
      toast.error('Please tell us how you heard about us');
      return false;
    }
    if (!termsAgreed || !privacyAgreed) {
      toast.error('Please agree to terms and privacy policy');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep4()) return;

    setLoading(true);

    try {
      // Create consultation booking
      const response = await fetch('/api/consultation-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          contactFullName,
          contactEmail,
          contactPhone,
          contactResidence,
          travelers: travelers.map(t => ({
            travelerName: t.name,
            travelerAge: parseInt(t.age),
            travelerType: t.type,
            travelerNationality: t.nationality,
            travelerSpecialNeeds: t.specialNeeds,
          })),
          destinationClarity,
          destinationDetails,
          travelStartDate,
          travelEndDate,
          tripDuration,
          tripType,
          mustDoActivities,
          accommodationStyle,
          transportMethod,
          carSeatNeeds: transportMethod.includes('Private car with driver') ? carSeatNeeds : null,
          driverRequirement: transportMethod.includes('Private car with driver') ? driverRequirement : null,
          yellowFever,
          malariaPlan,
          dietaryRestrictions,
          totalBudget,
          spendingStyle,
          referralSource,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit consultation request');
      }

      toast.success('Consultation request submitted!');

      // Initialize payment
      const paymentResponse = await fetch('/api/consultation-bookings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: data.consultation.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      // Redirect to Paystack payment page
      window.location.href = paymentData.authorization_url;

    } catch (error: any) {
      console.error('Error submitting consultation:', error);
      toast.error(error.message || 'Failed to submit consultation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-muted-foreground">
          Step {step} of 4
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {['Contact & Travelers', 'Trip Details', 'Logistics', 'Review & Submit'].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  step > idx + 1 
                    ? 'bg-green-500 text-white' 
                    : step === idx + 1 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span
                className={`text-xs text-center hidden sm:block ${
                  step === idx + 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Contact & Travelers */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={contactFullName}
                    onChange={(e) => setContactFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Phone (Include WhatsApp) *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Current City & Country *</label>
                  <input
                    type="text"
                    value={contactResidence}
                    onChange={(e) => setContactResidence(e.target.value)}
                    placeholder="e.g., Accra, Ghana"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Travelers Section */}
            <div className="bg-card border border-border p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Travel Party</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultation fee: GHS 500 per person (GHS 250 for infants under 2)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTraveler}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <Plus size={16} />
                  Add Traveler
                </button>
              </div>

              {travelers.map((traveler, index) => (
                <div key={index} className="bg-muted/50 border border-border p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-foreground">Traveler {index + 1}</h4>
                    {travelers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraveler(index)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Name *</label>
                      <input
                        type="text"
                        value={traveler.name}
                        onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Age at time of travel *</label>
                      <input
                        type="number"
                        value={traveler.age}
                        onChange={(e) => updateTraveler(index, 'age', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Traveler Type *</label>
                      <select
                        value={traveler.type}
                        onChange={(e) => updateTraveler(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Adult (18+)">Adult (18+)</option>
                        <option value="Teen (13-17)">Teen (13-17)</option>
                        <option value="Child (6-12)">Child (6-12)</option>
                        <option value="Toddler (2-5)">Toddler (2-5)</option>
                        <option value="Infant (0-1)">Infant (0-1)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Passport Nationality *</label>
                      <input
                        type="text"
                        value={traveler.nationality}
                        onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Special Needs (Allergies, dietary, mobility, medical)
                      </label>
                      <textarea
                        value={traveler.specialNeeds}
                        onChange={(e) => updateTraveler(index, 'specialNeeds', e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Fee Display */}
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Total Travelers:</span>
                  <span className="text-lg text-foreground">{travelers.length}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-foreground">Estimated Consultation Fee:</span>
                  <span className="text-2xl font-bold text-primary">GHS {calculateFee()}</span>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeAcknowledged}
                    onChange={(e) => setFeeAcknowledged(e.target.checked)}
                    className="mt-1 cursor-pointer"
                    required
                  />
                  <span className="text-sm text-foreground">
                    I understand the consultation fee is GHS 500 per person (GHS 250 for infants under 2).
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Trip Specifics */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Destination & Timing</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Destination Clarity *</label>
                  <div className="space-y-2">
                    {['We know exactly where', 'We have ideas', 'Need suggestions'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="destinationClarity"
                          value={option}
                          checked={destinationClarity === option}
                          onChange={(e) => setDestinationClarity(e.target.value)}
                          required
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Which regions/cities in Ghana? (e.g., Accra + Cape Coast + Ada)
                  </label>
                  <textarea
                    value={destinationDetails}
                    onChange={(e) => setDestinationDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Travel Start Date *</label>
                    <input
                      type="date"
                      value={travelStartDate}
                      onChange={(e) => setTravelStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Travel End Date *</label>
                    <input
                      type="date"
                      value={travelEndDate}
                      onChange={(e) => setTravelEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      min={travelStartDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Trip Duration *</label>
                  <select
                    value={tripDuration}
                    onChange={(e) => setTripDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select duration</option>
                    <option value="2-4 nights">2-4 nights</option>
                    <option value="5-7 nights">5-7 nights</option>
                    <option value="8-10 nights">8-10 nights</option>
                    <option value="11-14 nights">11-14 nights</option>
                    <option value="15+ nights">15+ nights</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Experience Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Trip Type (Select up to 3) *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Beach relaxation',
                      'Cultural/historical',
                      'Adventure/nature',
                      'City/shopping',
                      'Family roots/ancestry',
                      'Festival/event',
                      'Multi-gen reunion',
                    ].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={tripType.includes(type)}
                          onChange={() => toggleTripType(type)}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{tripType.length}/3 selected</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    List 3-5 must-have experiences *
                  </label>
                  <textarea
                    value={mustDoActivities}
                    onChange={(e) => setMustDoActivities(e.target.value)}
                    placeholder="e.g., Visit Cape Coast Castle, try local cuisine, beach time..."
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Accommodation Style *</label>
                  <select
                    value={accommodationStyle}
                    onChange={(e) => setAccommodationStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select accommodation style</option>
                    <option value="Luxury hotel/resort">Luxury hotel/resort</option>
                    <option value="Mid-range hotel">Mid-range hotel</option>
                    <option value="Serviced apartment/villa">Serviced apartment/villa</option>
                    <option value="Budget lodge/guesthouse">Budget lodge/guesthouse</option>
                    <option value="No preference">No preference</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Logistics */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Transportation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Transport Method *</label>
                  <div className="space-y-2">
                    {[
                      'Private car with driver',
                      'Domestic flights',
                      'Rental car (self-drive)',
                      'Intercity buses',
                    ].map((method) => (
                      <label key={method} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={transportMethod.includes(method)}
                          onChange={() => toggleTransportMethod(method)}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {transportMethod.includes('Private car with driver') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Car Seat Needs</label>
                      <div className="space-y-2">
                        {[
                          'Infant car seat (0-1 yr)',
                          'Toddler car seat (1-4 yr)',
                          'Booster seat (4-8 yr)',
                        ].map((seat) => (
                          <label key={seat} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={carSeatNeeds.includes(seat)}
                              onChange={() => toggleCarSeat(seat)}
                            />
                            <span className="text-sm">{seat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Driver Preference</label>
                      <div className="space-y-2">
                        {[
                          'Experienced with families/tourists',
                          'Any safe driver',
                          'No preference',
                        ].map((pref) => (
                          <label key={pref} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="driverRequirement"
                              value={pref}
                              checked={driverRequirement === pref}
                              onChange={(e) => setDriverRequirement(e.target.value)}
                            />
                            <span className="text-sm">{pref}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Health & Safety</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Yellow Fever Vaccination *</label>
                  <div className="space-y-2">
                    {['All vaccinated', 'Some vaccinated', 'None vaccinated', 'Unsure'].map((status) => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="yellowFever"
                          value={status}
                          checked={yellowFever === status}
                          onChange={(e) => setYellowFever(e.target.value)}
                          required
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Malaria Prevention Plan *</label>
                  <div className="space-y-2">
                    {['Will take prophylaxis', 'Will use mosquito prevention only', 'Undecided'].map((plan) => (
                      <label key={plan} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="malariaPlan"
                          value={plan}
                          checked={malariaPlan === plan}
                          onChange={(e) => setMalariaPlan(e.target.value)}
                          required
                        />
                        <span>{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Dietary Restrictions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Vegetarian', 'Vegan', 'Halal', 'No pork', 'Gluten-free', 'Other'].map((diet) => (
                      <label key={diet} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={dietaryRestrictions.includes(diet)}
                          onChange={() => toggleDietaryRestriction(diet)}
                        />
                        <span className="text-sm">{diet}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Budget</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Total Budget *</label>
                  <select
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select budget range</option>
                    <option value="GHS 5,000 - 10,000">GHS 5,000 - 10,000</option>
                    <option value="GHS 10,001 - 20,000">GHS 10,001 - 20,000</option>
                    <option value="GHS 20,001 - 35,000">GHS 20,001 - 35,000</option>
                    <option value="GHS 35,001 - 50,000">GHS 35,001 - 50,000</option>
                    <option value="GHS 50,001+">GHS 50,001+</option>
                    <option value="Need guidance on realistic budget">Need guidance on realistic budget</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Spending Style *</label>
                  <select
                    value={spendingStyle}
                    onChange={(e) => setSpendingStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  >
                    <option value="">Select spending style</option>
                    <option value="Budget-conscious">Budget-conscious</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Final Details</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">How did you hear about us? *</label>
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  required
                >
                  <option value="">Select source</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Friend Referral">Friend Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Consultation Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <span>{contactFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Travelers:</span>
                  <span>{travelers.length} person(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Travel Dates:</span>
                  <span>{travelStartDate} to {travelEndDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{tripDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Budget:</span>
                  <span>{totalBudget}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-gray-300 font-bold text-lg">
                  <span>Consultation Fee:</span>
                  <span className="text-primary">GHS {calculateFee()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span className="text-sm">
                  I understand this is a consultation request, not a booking. Final proposal will be sent before payment. *
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span className="text-sm">
                  I agree to the <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> *
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-input bg-background text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Submit & Pay GHS {calculateFee()}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
