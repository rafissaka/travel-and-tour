'use client';

import { useState, useEffect } from 'react';
import {
  User, GraduationCap, FileText, Award, MapPin, Phone,
  Mail, Calendar, ChevronRight, ChevronLeft, Check, Loader2, Briefcase, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface UserProfile {
  // Basic Info
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  
  // User Profile
  nationality?: string;
  passportNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    icon: User,
    description: 'Basic personal details',
  },
  {
    id: 2,
    title: 'Contact Information',
    icon: Phone,
    description: 'Contact and address details',
  },
  {
    id: 3,
    title: 'Academic Profile',
    icon: GraduationCap,
    description: 'Education level and preferences',
  },
  {
    id: 4,
    title: 'Work Experience',
    icon: Briefcase,
    description: 'Employment history (optional)',
  },
  {
    id: 5,
    title: 'Emergency Contact',
    icon: MapPin,
    description: 'Emergency contact information',
  },
];

const EDUCATION_LEVELS = [
  { value: 'HIGH_SCHOOL', label: 'High School / SHS' },
  { value: 'FOUNDATION', label: 'Foundation / Preparatory' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate / Bachelor\'s' },
  { value: 'POSTGRADUATE_DIPLOMA', label: 'Postgraduate Diploma' },
  { value: 'MASTERS', label: 'Master\'s Degree' },
  { value: 'DOCTORATE', label: 'Doctorate / PhD' },
  { value: 'CERTIFICATE', label: 'Certificate Program' },
  { value: 'PROFESSIONAL', label: 'Professional Certification' },
];

const GRADING_SYSTEMS = [
  { value: 'PERCENTAGE', label: 'Percentage (0-100%)' },
  { value: 'GPA_4', label: 'GPA 4.0 Scale' },
  { value: 'GPA_5', label: 'GPA 5.0 Scale' },
  { value: 'CGPA_10', label: 'CGPA 10.0 Scale' },
  { value: 'WASSCE', label: 'WASSCE Grades (A1-F9)' },
  { value: 'FIRST_CLASS', label: 'UK Classification (First Class, etc.)' },
  { value: 'LETTER', label: 'Letter Grades (A-F)' },
  { value: 'OTHER', label: 'Other' },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Sweden', 'Denmark', 'Ireland', 'New Zealand', 
  'Singapore', 'Switzerland', 'Japan', 'South Korea', 'Ghana'
];

export default function CompleteProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 1: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  // Step 2: Contact Information
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Step 3: Academic Profile
  const [currentEducationLevel, setCurrentEducationLevel] = useState('');
  const [highestEducationLevel, setHighestEducationLevel] = useState('');
  const [intendedStudyLevel, setIntendedStudyLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [otherCountry, setOtherCountry] = useState('');
  const [gpa, setGpa] = useState('');
  const [gradingSystem, setGradingSystem] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  // Step 4: Work Experience (Optional)
  const [workExperiences, setWorkExperiences] = useState<Array<{
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    description: string;
  }>>([]);

  // Step 5: Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Fetch user basic info
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setEmail(userData.user?.email || '');
        setFirstName(userData.user?.firstName || '');
        setLastName(userData.user?.lastName || '');
        setPhone(userData.user?.phone || '');
      }

      // Fetch user profile
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setDateOfBirth(profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '');
        setNationality(profileData.nationality || '');
        setPassportNumber(profileData.passportNumber || '');
        setEmergencyContactName(profileData.emergencyContact || '');
        setEmergencyContactPhone(profileData.emergencyPhone || '');
        setWorkExperiences(profileData.workExperience || []);
      }

      // Fetch academic profile
      const academicResponse = await fetch('/api/user/academic-profile');
      if (academicResponse.ok) {
        const academicData = await academicResponse.json();
        setCurrentEducationLevel(academicData.currentEducationLevel || '');
        setHighestEducationLevel(academicData.highestEducationLevel || '');
        setIntendedStudyLevel(academicData.intendedStudyLevel || '');
        setFieldOfStudy(academicData.fieldOfStudy || '');
        setPreferredCountries(academicData.preferredCountries || []);
        setGpa(academicData.gpa || '');
        setGradingSystem(academicData.gradingSystem || '');
        setInstitutionName(academicData.institutionName || '');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!firstName || !lastName) {
          toast.error('Please enter your first and last name');
          return false;
        }
        return true;
      case 2:
        if (!phone) {
          toast.error('Please enter your phone number');
          return false;
        }
        return true;
      case 3:
        if (!currentEducationLevel) {
          toast.error('Please select your current education level');
          return false;
        }
        return true;
      case 4:
        // Work experience is optional, always return true
        return true;
      case 5:
        if (!emergencyContactName || !emergencyContactPhone) {
          toast.error('Please provide emergency contact information');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setSaving(true);
    try {
      // Update user basic info
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      // Update user profile
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth: dateOfBirth || null,
          nationality: nationality || null,
          passportNumber: passportNumber || null,
          emergencyContact: emergencyContactName || null,
          emergencyPhone: emergencyContactPhone || null,
          address: address || null,
          city: city || null,
          state: '', // Not captured in form yet
          postalCode: postalCode || null,
          country: country || null,
          workExperience: workExperiences.length > 0 ? workExperiences : null,
        }),
      });

      // Update academic profile
      await fetch('/api/user/academic-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEducationLevel: currentEducationLevel || null,
          highestEducationLevel: highestEducationLevel || null,
          intendedStudyLevel: intendedStudyLevel || null,
          fieldOfStudy: fieldOfStudy || null,
          preferredCountries,
          gpa: gpa || null,
          gradingSystem: gradingSystem || null,
          institutionName: institutionName || null,
        }),
      });

      toast.success('Profile completed successfully!');
      
      // Redirect to applications page
      window.location.href = '/profile/applications';
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getCompletionPercentage = () => {
    return Math.round((currentStep / STEPS.length) * 100);
  };

  if (loading) {
    return <PageLoader text="Loading profile..." />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Fill in your information to unlock program matches
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {getCompletionPercentage()}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getCompletionPercentage()}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/10'
                  : isCompleted
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {isCompleted ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">Let's start with your basic details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ghanaian"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="G1234567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Contact Information</h2>
                  <p className="text-muted-foreground">How can we reach you?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-border rounded-lg cursor-not-allowed text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+233 20 123 4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Accra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="GA-123-4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Academic Profile */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Academic Profile</h2>
                  <p className="text-muted-foreground">Tell us about your education goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Education Level *
                    </label>
                    <select
                      value={currentEducationLevel}
                      onChange={(e) => setCurrentEducationLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Highest Education Level
                    </label>
                    <select
                      value={highestEducationLevel}
                      onChange={(e) => setHighestEducationLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Intended Study Level
                    </label>
                    <select
                      value={intendedStudyLevel}
                      onChange={(e) => setIntendedStudyLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current/Most Recent Institution
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., University of Ghana, Achimota School"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GPA/Grade
                    </label>
                    <input
                      type="text"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 3.5, 75%, A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Grading System
                    </label>
                    <select
                      value={gradingSystem}
                      onChange={(e) => setGradingSystem(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select grading system</option>
                      {GRADING_SYSTEMS.map((system) => (
                        <option key={system.value} value={system.value}>
                          {system.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Preferred Study Countries
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-background border border-border rounded-lg max-h-60 overflow-y-auto">
                      {COUNTRIES.map((c) => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={preferredCountries.includes(c)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferredCountries([...preferredCountries, c]);
                              } else {
                                setPreferredCountries(preferredCountries.filter(country => country !== c));
                              }
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">{c}</span>
                        </label>
                      ))}
                    </div>

                    {/* Other Country Input */}
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otherCountry}
                          onChange={(e) => setOtherCountry(e.target.value)}
                          placeholder="Other country (if not listed)"
                          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (otherCountry.trim() && !preferredCountries.includes(otherCountry.trim())) {
                              setPreferredCountries([...preferredCountries, otherCountry.trim()]);
                              setOtherCountry('');
                            }
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Selected Countries */}
                    {preferredCountries.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {preferredCountries.map((c) => (
                          <span
                            key={c}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                          >
                            {c}
                            <button
                              type="button"
                              onClick={() => setPreferredCountries(preferredCountries.filter(country => country !== c))}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Work Experience */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Work Experience</h2>
                  <p className="text-muted-foreground">Add your work history (optional)</p>
                </div>

                {/* Work Experience List */}
                {workExperiences.length > 0 && (
                  <div className="space-y-4">
                    {workExperiences.map((exp, index) => (
                      <div key={index} className="p-4 bg-background border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{exp.jobTitle}</h3>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = workExperiences.filter((_, i) => i !== index);
                              setWorkExperiences(updated);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Work Experience Form */}
                <div className="p-6 bg-accent/5 border border-border rounded-lg space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Work Experience
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="work-company"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        id="work-title"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your position"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        id="work-start"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="month"
                        id="work-end"
                        disabled={document.getElementById('work-current') instanceof HTMLInputElement && (document.getElementById('work-current') as HTMLInputElement).checked}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id="work-current"
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          onChange={(e) => {
                            const endDateInput = document.getElementById('work-end') as HTMLInputElement;
                            if (endDateInput) {
                              endDateInput.disabled = e.target.checked;
                              if (e.target.checked) {
                                endDateInput.value = '';
                              }
                            }
                          }}
                        />
                        <span className="text-sm text-foreground">I currently work here</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Job Description
                      </label>
                      <textarea
                        id="work-description"
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Brief description of your responsibilities"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          const company = (document.getElementById('work-company') as HTMLInputElement)?.value;
                          const jobTitle = (document.getElementById('work-title') as HTMLInputElement)?.value;
                          const startDate = (document.getElementById('work-start') as HTMLInputElement)?.value;
                          const endDate = (document.getElementById('work-end') as HTMLInputElement)?.value;
                          const currentlyWorking = (document.getElementById('work-current') as HTMLInputElement)?.checked || false;
                          const description = (document.getElementById('work-description') as HTMLTextAreaElement)?.value;

                          if (!company || !jobTitle || !startDate) {
                            toast.error('Please fill in company name, job title, and start date');
                            return;
                          }

                          setWorkExperiences([
                            ...workExperiences,
                            {
                              company,
                              jobTitle,
                              startDate,
                              endDate: currentlyWorking ? 'Present' : endDate,
                              currentlyWorking,
                              description,
                            },
                          ]);

                          // Clear form
                          (document.getElementById('work-company') as HTMLInputElement).value = '';
                          (document.getElementById('work-title') as HTMLInputElement).value = '';
                          (document.getElementById('work-start') as HTMLInputElement).value = '';
                          (document.getElementById('work-end') as HTMLInputElement).value = '';
                          (document.getElementById('work-current') as HTMLInputElement).checked = false;
                          (document.getElementById('work-description') as HTMLTextAreaElement).value = '';

                          toast.success('Work experience added');
                        }}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Work Experience
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Optional:</strong> Work experience can strengthen your application, but you can skip this step if you don't have any work history.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Emergency Contact */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Contact</h2>
                  <p className="text-muted-foreground">Who should we contact in case of emergency?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+233 20 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Relationship
                    </label>
                    <select
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select relationship</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5 text-blue-600" />
                    Almost Done!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    After completing this step, you'll be able to see programs you qualify for and apply with one click!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
