'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Globe, Calendar, Users, 
  FileText, Check, ArrowRight, ArrowLeft, Plane, Clock, 
  AlertCircle, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface VisaAssistanceFormProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
}

// Fixed consultation fee for visa assistance
const VISA_CONSULTATION_FEE = 500; // GHS per applicant

interface Applicant {
  name: string;
  age: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

export default function VisaAssistanceForm({ 
  serviceId, 
  serviceTitle, 
  onClose 
}: VisaAssistanceFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Contact Information
    contactFullName: '',
    contactEmail: '',
    contactPhone: '',
    contactResidence: '',
    
    // Visa Details
    destinationCountry: '',
    travelPurpose: '',
    plannedTravelDate: '',
    durationOfStay: '',
    
    // Applicants
    applicants: [
      { name: '', age: '', nationality: '', passportNumber: '', passportExpiry: '' }
    ] as Applicant[],
    
    // Current Status
    hasValidPassport: true,
    passportExpiryDate: '',
    previousVisaRefusal: false,
    refusalDetails: '',
    
    // Additional Services
    needsDocumentation: false,
    needsAppointment: false,
    needsTranslation: false,
    rushProcessing: false,
    
    // Additional Information
    additionalNotes: '',
    referralSource: 'Website',
  });

  const travelPurposes = [
    'Tourism',
    'Business',
    'Study',
    'Visit Family/Friends',
    'Work',
    'Medical Treatment',
    'Transit',
    'Other'
  ];

  const referralSources = [
    'Website',
    'Social Media',
    'Friend/Family Referral',
    'Google Search',
    'Advertisement',
    'Previous Customer',
    'Other'
  ];

  // Calculate total consultation fee based on applicants
  const calculateFee = () => {
    return formData.applicants.length * VISA_CONSULTATION_FEE;
  };

  // Add new applicant
  const addApplicant = () => {
    setFormData({
      ...formData,
      applicants: [
        ...formData.applicants,
        { name: '', age: '', nationality: '', passportNumber: '', passportExpiry: '' }
      ]
    });
  };

  // Remove applicant
  const removeApplicant = (index: number) => {
    if (formData.applicants.length > 1) {
      const newApplicants = formData.applicants.filter((_, i) => i !== index);
      setFormData({ ...formData, applicants: newApplicants });
    }
  };

  // Update applicant
  const updateApplicant = (index: number, field: keyof Applicant, value: string) => {
    const newApplicants = [...formData.applicants];
    newApplicants[index][field] = value;
    setFormData({ ...formData, applicants: newApplicants });
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.contactFullName || !formData.contactEmail || !formData.contactPhone || !formData.contactResidence) {
          toast.error('Please fill in all contact information');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.destinationCountry || !formData.travelPurpose) {
          toast.error('Please fill in all visa details');
          return false;
        }
        return true;
      
      case 3:
        for (let i = 0; i < formData.applicants.length; i++) {
          const applicant = formData.applicants[i];
          if (!applicant.name || !applicant.age || !applicant.nationality) {
            toast.error(`Please complete information for applicant ${i + 1}`);
            return false;
          }
        }
        if (!formData.hasValidPassport && !formData.passportExpiryDate) {
          toast.error('Please provide passport expiry date');
          return false;
        }
        if (formData.previousVisaRefusal && !formData.refusalDetails) {
          toast.error('Please provide details about previous visa refusal');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Check if user is logged in first
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        toast.info('Please log in to submit your visa assistance request');
        onClose();
        router.push('/auth/login?redirect=/services/visa-assistance');
        return;
      }

      // Step 1: Create the booking with fee estimate
      const feeEstimate = calculateFee(); // GHS 500 per applicant
      
      const bookingResponse = await fetch('/api/visa-assistance-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          ...formData,
          feeEstimate, // Include the calculated fee
        }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.error || 'Failed to submit booking');
      }

      const booking = await bookingResponse.json();
      
      toast.success('Visa assistance request submitted successfully!');
      
      // Step 2: Initialize payment
      const paymentResponse = await fetch('/api/visa-assistance-bookings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visaAssistanceId: booking.id,
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
      console.error('Error submitting visa assistance booking:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Contact Info', icon: User },
    { number: 2, title: 'Visa Details', icon: Globe },
    { number: 3, title: 'Applicants', icon: Users },
    { number: 4, title: 'Additional Services', icon: FileText },
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
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= step.number
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    currentStep > step.number ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactFullName}
                    onChange={(e) => setFormData({ ...formData, contactFullName: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Country of Residence *
                  </label>
                  <input
                    type="text"
                    value={formData.contactResidence}
                    onChange={(e) => setFormData({ ...formData, contactResidence: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Visa Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Visa Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Destination Country *
                  </label>
                  <input
                    type="text"
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., United Kingdom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Travel Purpose *
                  </label>
                  <select
                    value={formData.travelPurpose}
                    onChange={(e) => setFormData({ ...formData, travelPurpose: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select purpose</option>
                    {travelPurposes.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Planned Travel Date
                  </label>
                  <input
                    type="date"
                    value={formData.plannedTravelDate}
                    onChange={(e) => setFormData({ ...formData, plannedTravelDate: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration of Stay
                  </label>
                  <input
                    type="text"
                    value={formData.durationOfStay}
                    onChange={(e) => setFormData({ ...formData, durationOfStay: e.target.value })}
                    className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 2 weeks, 3 months"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Applicants */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Applicant Information
                </h3>
                <button
                  onClick={addApplicant}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Applicant
                </button>
              </div>

              {formData.applicants.map((applicant, index) => (
                <div key={index} className="p-4 border-2 border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">Applicant {index + 1}</h4>
                    {formData.applicants.length > 1 && (
                      <button
                        onClick={() => removeApplicant(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={applicant.name}
                        onChange={(e) => updateApplicant(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        value={applicant.age}
                        onChange={(e) => updateApplicant(index, 'age', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Age"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        value={applicant.nationality}
                        onChange={(e) => updateApplicant(index, 'nationality', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Nationality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={applicant.passportNumber}
                        onChange={(e) => updateApplicant(index, 'passportNumber', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Passport number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Passport Expiry Date
                      </label>
                      <input
                        type="date"
                        value={applicant.passportExpiry}
                        onChange={(e) => updateApplicant(index, 'passportExpiry', e.target.value)}
                        className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.hasValidPassport}
                    onChange={(e) => setFormData({ ...formData, hasValidPassport: e.target.checked })}
                    className="w-5 h-5 rounded border-border"
                  />
                  <label className="text-sm font-medium text-foreground">
                    I/We have a valid passport
                  </label>
                </div>

                {!formData.hasValidPassport && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Expected Passport Issuance Date
                    </label>
                    <input
                      type="date"
                      value={formData.passportExpiryDate}
                      onChange={(e) => setFormData({ ...formData, passportExpiryDate: e.target.value })}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.previousVisaRefusal}
                    onChange={(e) => setFormData({ ...formData, previousVisaRefusal: e.target.checked })}
                    className="w-5 h-5 rounded border-border"
                  />
                  <label className="text-sm font-medium text-foreground">
                    I/We have been refused a visa before
                  </label>
                </div>

                {formData.previousVisaRefusal && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Please provide details about the refusal *
                    </label>
                    <textarea
                      value={formData.refusalDetails}
                      onChange={(e) => setFormData({ ...formData, refusalDetails: e.target.value })}
                      className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Country, date, reason..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Additional Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Additional Services & Information
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select any additional services you may need:
                </p>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.needsDocumentation}
                      onChange={(e) => setFormData({ ...formData, needsDocumentation: e.target.checked })}
                      className="w-5 h-5 rounded border-border"
                    />
                    <div>
                      <div className="font-medium text-foreground">Document Preparation</div>
                      <div className="text-sm text-muted-foreground">Help with preparing and organizing required documents</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.needsAppointment}
                      onChange={(e) => setFormData({ ...formData, needsAppointment: e.target.checked })}
                      className="w-5 h-5 rounded border-border"
                    />
                    <div>
                      <div className="font-medium text-foreground">Embassy Appointment Booking</div>
                      <div className="text-sm text-muted-foreground">Assistance with scheduling embassy/consulate appointments</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.needsTranslation}
                      onChange={(e) => setFormData({ ...formData, needsTranslation: e.target.checked })}
                      className="w-5 h-5 rounded border-border"
                    />
                    <div>
                      <div className="font-medium text-foreground">Document Translation</div>
                      <div className="text-sm text-muted-foreground">Professional translation of documents if needed</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.rushProcessing}
                      onChange={(e) => setFormData({ ...formData, rushProcessing: e.target.checked })}
                      className="w-5 h-5 rounded border-border"
                    />
                    <div>
                      <div className="font-medium text-foreground">Rush Processing</div>
                      <div className="text-sm text-muted-foreground">Expedited service for urgent travel needs</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Notes or Special Requests
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Any other information we should know about your visa application..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  How did you hear about us?
                </label>
                <select
                  value={formData.referralSource}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {referralSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Fee Display */}
              <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Total Applicants:</span>
                  <span className="text-lg text-foreground">{formData.applicants.length}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Fee per Applicant:</span>
                  <span className="text-lg text-foreground">GHS {VISA_CONSULTATION_FEE}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-primary/30">
                  <span className="text-xl font-bold text-foreground">Consultation Fee:</span>
                  <span className="text-3xl font-bold text-primary">GHS {calculateFee()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  This fee covers our visa assistance consultation and initial document review.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                      <li>Our visa specialists will review your request within 24 hours</li>
                      <li>We'll provide a detailed quote and timeline for your visa application</li>
                      <li>You'll receive a personalized checklist of required documents</li>
                      <li>We'll guide you through every step of the visa application process</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <button
          onClick={currentStep === 1 ? onClose : handleBack}
          className="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
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
