'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users, Plane, Home, Car, Shield, DollarSign, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface Traveler {
  travelerName: string;
  travelerAge: number;
  travelerType: string;
  travelerNationality: string;
  travelerSpecialNeeds: string;
}

interface ConsultationDetail {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactResidence: string;
  travelers: Traveler[];
  travelerCount: number;
  feeEstimate: number;
  destinationClarity: string;
  destinationDetails: string | null;
  travelStartDate: string;
  travelEndDate: string;
  tripDuration: string;
  tripType: string[];
  mustDoActivities: string;
  accommodationStyle: string;
  transportMethod: string[];
  carSeatNeeds: string[] | null;
  driverRequirement: string | null;
  yellowFever: string;
  malariaPlan: string;
  dietaryRestrictions: string[] | null;
  totalBudget: string;
  spendingStyle: string;
  referralSource: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt: string | null;
  service: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function EditConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ConsultationDetail | null>(null);

  useEffect(() => {
    if (consultationId) {
      fetchConsultation();
    }
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const response = await fetch(`/api/consultation-bookings?id=${consultationId}`);
      if (response.ok) {
        const data = await response.json();

        // Only allow editing if payment status is PAID
        if (data.paymentStatus !== 'PAID') {
          toast.error('You can only edit paid consultations');
          router.push('/profile/bookings?tab=consultations');
          return;
        }

        setFormData(data);
      } else {
        toast.error('Consultation not found');
        router.push('/profile/bookings?tab=consultations');
      }
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast.error('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    // Validation
    if (!formData.contactFullName || !formData.contactEmail || !formData.contactPhone) {
      toast.error('Please fill in all required contact fields');
      return;
    }

    if (!formData.travelStartDate || !formData.travelEndDate) {
      toast.error('Please select travel dates');
      return;
    }

    if (formData.travelers.length === 0) {
      toast.error('Please add at least one traveler');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/consultation-bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success('Consultation updated successfully!');
        router.push(`/profile/consultations/${consultationId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update consultation');
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast.error('Failed to update consultation');
    } finally {
      setSaving(false);
    }
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: any) => {
    if (!formData) return;

    const updatedTravelers = [...formData.travelers];
    updatedTravelers[index] = {
      ...updatedTravelers[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      travelers: updatedTravelers,
      travelerCount: updatedTravelers.length,
    });
  };

  // Note: Adding/removing travelers after payment is disabled
  // because the payment was calculated for a specific number of travelers

  const toggleArrayValue = (field: 'tripType' | 'transportMethod' | 'dietaryRestrictions', value: string) => {
    if (!formData) return;

    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Edit Consultation
              </h1>
              <p className="text-muted-foreground">
                {formData.service.title}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-background border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactFullName}
                  onChange={(e) => setFormData({ ...formData, contactFullName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Residence <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactResidence}
                  onChange={(e) => setFormData({ ...formData, contactResidence: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Travel Party ({formData.travelerCount} Traveler{formData.travelerCount > 1 ? 's' : ''})
              </h2>
            </div>

            {/* Info message about travelers */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> You cannot add or remove travelers after payment since the fee was calculated for {formData.travelerCount} traveler{formData.travelerCount > 1 ? 's' : ''}. You can only update their information.
              </p>
            </div>

            <div className="space-y-4">
              {formData.travelers.map((traveler, index) => (
                <div key={index} className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Traveler {index + 1}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                      <input
                        type="text"
                        value={traveler.travelerName}
                        onChange={(e) => updateTraveler(index, 'travelerName', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Age</label>
                      <input
                        type="number"
                        value={traveler.travelerAge}
                        onChange={(e) => updateTraveler(index, 'travelerAge', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                      <select
                        value={traveler.travelerType}
                        onChange={(e) => updateTraveler(index, 'travelerType', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="Adult">Adult</option>
                        <option value="Child">Child</option>
                        <option value="Infant">Infant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Nationality</label>
                      <input
                        type="text"
                        value={traveler.travelerNationality}
                        onChange={(e) => updateTraveler(index, 'travelerNationality', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Special Needs</label>
                      <textarea
                        value={traveler.travelerSpecialNeeds}
                        onChange={(e) => updateTraveler(index, 'travelerSpecialNeeds', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Trip Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Travel Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.travelStartDate.split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, travelStartDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Travel End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.travelEndDate.split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, travelEndDate: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Trip Duration</label>
                <select
                  value={formData.tripDuration}
                  onChange={(e) => setFormData({ ...formData, tripDuration: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1-3 days">1-3 days</option>
                  <option value="4-7 days">4-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1+ months">1+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Accommodation Style</label>
                <select
                  value={formData.accommodationStyle}
                  onChange={(e) => setFormData({ ...formData, accommodationStyle: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Budget-friendly hostels">Budget-friendly hostels</option>
                  <option value="Mid-range hotels">Mid-range hotels</option>
                  <option value="Luxury resorts">Luxury resorts</option>
                  <option value="Vacation rentals">Vacation rentals</option>
                  <option value="Mix of different styles">Mix of different styles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Destination Clarity</label>
                <select
                  value={formData.destinationClarity}
                  onChange={(e) => setFormData({ ...formData, destinationClarity: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Yes, I know exactly where">Yes, I know exactly where</option>
                  <option value="I have a few places in mind">I have a few places in mind</option>
                  <option value="No, I need recommendations">No, I need recommendations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                <select
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Under $1,000">Under $1,000</option>
                  <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                  <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                  <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Destination Details</label>
                <textarea
                  value={formData.destinationDetails || ''}
                  onChange={(e) => setFormData({ ...formData, destinationDetails: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="Tell us more about your destination preferences..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Trip Types</label>
                <div className="flex flex-wrap gap-2">
                  {['Adventure', 'Relaxation', 'Cultural', 'Family-friendly', 'Romantic', 'Business'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayValue('tripType', type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.tripType.includes(type)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Must-Do Activities</label>
                <textarea
                  value={formData.mustDoActivities}
                  onChange={(e) => setFormData({ ...formData, mustDoActivities: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  placeholder="What activities or experiences are must-haves for your trip?"
                />
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Logistics & Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Transport Methods</label>
                <div className="flex flex-wrap gap-2">
                  {['Flights', 'Car rental', 'Public transport', 'Private transfers', 'Walking/biking'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => toggleArrayValue('transportMethod', method)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.transportMethod.includes(method)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Yellow Fever Status</label>
                <select
                  value={formData.yellowFever}
                  onChange={(e) => setFormData({ ...formData, yellowFever: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Yes, I have it">Yes, I have it</option>
                  <option value="No, I need it">No, I need it</option>
                  <option value="Not required">Not required</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Malaria Prevention</label>
                <select
                  value={formData.malariaPlan}
                  onChange={(e) => setFormData({ ...formData, malariaPlan: e.target.value })}
                  className="w-full px-4 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Yes, taking medication">Yes, taking medication</option>
                  <option value="No, not planning to">No, not planning to</option>
                  <option value="Need recommendations">Need recommendations</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'None'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleArrayValue('dietaryRestrictions', diet)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        (formData.dietaryRestrictions || []).includes(diet)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-background border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
