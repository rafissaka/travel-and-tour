'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Users, Plane, Home, Car, Shield, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface ConsultationDetail {
  id: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactResidence: string;
  travelers: any[];
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
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;
  
  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
        setConsultation(data);
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

  if (loading) {
    return <PageLoader />;
  }

  if (!consultation) {
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
            Back to Bookings
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {consultation.service.title}
              </h1>
              <p className="text-muted-foreground">
                Consultation Request Details
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                consultation.paymentStatus === 'PAID' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {consultation.paymentStatus}
              </span>
              <div className="text-2xl font-bold text-primary">
                GHS {Number(consultation.feeEstimate).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name</label>
                <p className="text-foreground font-medium">{consultation.contactFullName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-foreground font-medium">{consultation.contactEmail}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone / WhatsApp</label>
                <p className="text-foreground font-medium">{consultation.contactPhone}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Current Residence</label>
                <p className="text-foreground font-medium">{consultation.contactResidence}</p>
              </div>
            </div>
          </div>

          {/* Travelers */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Travel Party ({consultation.travelerCount} Traveler{consultation.travelerCount > 1 ? 's' : ''})
            </h2>
            <div className="space-y-4">
              {consultation.travelers.map((traveler: any, index: number) => (
                <div key={index} className="bg-muted/50 border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Traveler {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 text-foreground font-medium">{traveler.travelerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-2 text-foreground font-medium">{traveler.travelerAge} years</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 text-foreground font-medium">{traveler.travelerType}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Nationality:</span>
                      <span className="ml-2 text-foreground font-medium">{traveler.travelerNationality}</span>
                    </div>
                    {traveler.travelerSpecialNeeds && (
                      <div className="md:col-span-3">
                        <span className="text-muted-foreground">Special Needs:</span>
                        <p className="mt-1 text-foreground">{traveler.travelerSpecialNeeds}</p>
                      </div>
                    )}
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
                <label className="text-sm text-muted-foreground">Travel Dates</label>
                <p className="text-foreground font-medium">
                  {new Date(consultation.travelStartDate).toLocaleDateString()} - {new Date(consultation.travelEndDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duration</label>
                <p className="text-foreground font-medium">{consultation.tripDuration}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Destination Clarity</label>
                <p className="text-foreground font-medium">{consultation.destinationClarity}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Accommodation Style</label>
                <p className="text-foreground font-medium">{consultation.accommodationStyle}</p>
              </div>
              {consultation.destinationDetails && (
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Destination Details</label>
                  <p className="text-foreground">{consultation.destinationDetails}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Trip Types</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {consultation.tripType.map((type: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Must-Do Activities</label>
                <p className="text-foreground mt-1">{consultation.mustDoActivities}</p>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              Logistics & Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Transport Methods</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {consultation.transportMethod.map((method: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Budget Range</label>
                <p className="text-foreground font-medium">{consultation.totalBudget}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Spending Style</label>
                <p className="text-foreground font-medium">{consultation.spendingStyle}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Yellow Fever Status</label>
                <p className="text-foreground font-medium">{consultation.yellowFever}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Malaria Prevention</label>
                <p className="text-foreground font-medium">{consultation.malariaPlan}</p>
              </div>
              {consultation.dietaryRestrictions && consultation.dietaryRestrictions.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground">Dietary Restrictions</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {consultation.dietaryRestrictions.map((diet: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Booking Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Booked on:</span>
                <span className="ml-2 text-foreground font-medium">
                  {new Date(consultation.createdAt).toLocaleString()}
                </span>
              </div>
              {consultation.confirmedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-muted-foreground">Confirmed on:</span>
                  <span className="text-foreground font-medium">
                    {new Date(consultation.confirmedAt).toLocaleString()}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">How they found us:</span>
                <span className="ml-2 text-foreground font-medium">{consultation.referralSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
