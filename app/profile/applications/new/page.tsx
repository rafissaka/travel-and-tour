'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, Upload, Loader2, X, FileText, Image as ImageIcon, CheckCircle, Download, GraduationCap, User, Phone, Users, BookOpen, Plane, FileCheck, Info, Menu, Plus, Trash2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedDocument {
  url: string;
  publicId: string;
  type: string;
  name: string;
}

interface Program {
  id: string;
  title: string;
  slug: string;
  country: string | null;
  university: string | null;
  duration: string | null;
  startDate: string | null;
  endDate: string | null;
  service: {
    title: string;
  };
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showStepsMenu, setShowStepsMenu] = useState(false);
  const [documents, setDocuments] = useState<Record<string, UploadedDocument>>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [education, setEducation] = useState<Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>>([]);
  const [workExperience, setWorkExperience] = useState<Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }>>([]);
  const [formData, setFormData] = useState({
    // Program ID
    programId: '',
    // Program Details
    programName: '',
    programCountry: '',
    programUniversity: '',
    programStartDate: '',
    programEndDate: '',
    programDuration: '',

    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    sex: 'MALE',

    // Contact Information
    email: '',
    phone: '',
    alternativePhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

    // Home Address
    homeNumber: '',
    streetAddress: '',
    postalAddress: '',

    // Family Information
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',

    // Educational Background
    currentEducationLevel: '',
    schoolName: '',
    gradeLevel: '',
    gpa: '',

    // Passport Information
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    passportIssueCountry: '',

    // Additional Information
    previousTravel: false,
    previousTravelDetails: '',
    medicalConditions: '',
    specialRequirements: '',
    motivation: '',

    // Document URLs
    passportCopyUrl: '',
    photoUrl: '',
    birthCertificateUrl: '',
    transcriptUrl: '',
    wassceUrl: '',
    medicalResultsUrl: '',
    additionalDocuments: [],
  });

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs?active=true');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);

    if (!programId) {
      setFormData(prev => ({
        ...prev,
        programId: '',
        programName: '',
        programCountry: '',
        programUniversity: '',
        programStartDate: '',
        programEndDate: '',
        programDuration: '',
      }));
      return;
    }

    const program = programs.find(p => p.id === programId);
    if (program) {
      setFormData(prev => ({
        ...prev,
        programId: program.id,
        programName: program.title,
        programCountry: program.country || '',
        programUniversity: program.university || '',
        programStartDate: program.startDate ? program.startDate.split('T')[0] : '',
        programEndDate: program.endDate ? program.endDate.split('T')[0] : '',
        programDuration: program.duration || '',
      }));
      toast.success(`Program selected: ${program.title}`);
    }
  };

  const validatePassportPhoto = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        // Passport photo should be square and at least 600x600 pixels (2x2 inches at 300 DPI)
        const isSquare = img.width === img.height;
        const isLargeEnough = img.width >= 600 && img.height >= 600;
        resolve(isSquare && isLargeEnough);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  };

  const handleFileUpload = async (file: File, documentType: string, fieldName: string) => {
    setUploading(true);
    try {
      // Validate passport photo dimensions
      if (documentType === 'photo' && file.type.startsWith('image/')) {
        const validDimensions = await validatePassportPhoto(file);
        if (!validDimensions) {
          setUploading(false);
          toast.error('Passport photo must be 2x2 inches (600x600 pixels minimum). Please resize and try again.', {
            duration: 5000,
          });
          return;
        }
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('documentType', documentType);

      const response = await fetch('/api/applications/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          url: result.url,
          publicId: result.publicId,
          type: documentType,
          name: file.name,
        }
      }));

      setFormData(prev => ({
        ...prev,
        [fieldName]: result.url
      }));

      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = async (documentType: string, fieldName: string) => {
    const doc = documents[documentType];
    if (!doc) return;

    try {
      await fetch(`/api/applications/upload?publicId=${encodeURIComponent(doc.publicId)}`, {
        method: 'DELETE',
      });

      setDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentType];
        return newDocs;
      });

      setFormData(prev => ({
        ...prev,
        [fieldName]: ''
      }));

      toast.success('Document removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove document');
    }
  };

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    // Check if trying to submit (not draft) with incomplete required steps
    if (status === 'SUBMITTED' && !canSubmit()) {
      const incompleteSteps = steps
        .filter((step) => !isStepComplete(step.number) && step.number !== 7) // Skip optional step 7
        .map((step) => step.title);
      
      toast.error(
        `Please complete all required steps before submitting:\n${incompleteSteps.join(', ')}`,
        { duration: 5000 }
      );
      return;
    }

    setLoading(true);
    try {
      const additionalDocs = Object.keys(documents)
        .filter(key => !['passport', 'photo', 'birthCertificate', 'transcript', 'medicalResults', 'wassce'].includes(key))
        .map(key => ({
          type: key,
          url: documents[key].url,
          name: documents[key].name
        }));

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          education,
          workExperience,
          additionalDocuments: additionalDocs,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        toast.success(status === 'DRAFT' ? 'Application saved as draft' : 'Application submitted successfully');
        router.push('/profile/applications');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Program Selection', icon: GraduationCap, description: 'Choose your program' },
    { number: 2, title: 'Personal Information', icon: User, description: 'Your basic details' },
    { number: 3, title: 'Contact Information', icon: Phone, description: 'How to reach you' },
    { number: 4, title: 'Family Information', icon: Users, description: 'Family & emergency' },
    { number: 5, title: 'Education', icon: BookOpen, description: 'Academic background' },
    { number: 6, title: 'Passport', icon: Plane, description: 'Travel documents' },
    { number: 7, title: 'Additional Info', icon: Info, description: 'Extra details' },
    { number: 8, title: 'Documents', icon: FileCheck, description: 'Upload files' },
  ];

  const isStepComplete = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.programName && formData.programCountry);
      case 2:
        return !!(formData.firstName && formData.lastName && formData.dateOfBirth && formData.nationality);
      case 3:
        return !!(formData.email && formData.phone && formData.address && formData.city && formData.country);
      case 4:
        return !!(formData.motherName && formData.fatherName && formData.emergencyContactName && formData.emergencyContactPhone);
      case 5:
        return education.length > 0; // At least one education entry
      case 6:
        return !!(formData.passportNumber && formData.passportIssueDate && formData.passportExpiryDate);
      case 7:
        return true; // Optional step
      case 8:
        return !!(documents.passport && documents.photo && documents.birthCertificate && documents.transcript);
      default:
        return false;
    }
  };

  const canSubmit = () => {
    // Check if all required steps are complete for final submission
    return steps.slice(0, -1).every((step) => isStepComplete(step.number)); // All except optional step 7
  };

  const handleNext = () => {
    if (!isStepComplete(currentStep)) {
      toast.warning(`Step ${currentStep} is incomplete. You can continue but remember to complete it before submitting.`, {
        duration: 4000,
      });
    }
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const handleStepChange = (stepNumber: number) => {
    // Check if current step is incomplete when moving forward
    if (stepNumber > currentStep && !isStepComplete(currentStep)) {
      toast.warning(`Step ${currentStep} is incomplete. You can continue but remember to complete it before submitting.`, {
        duration: 4000,
      });
    }
    setCurrentStep(stepNumber);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Program Selector */}
            {programs.length > 0 && (
              <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">Available Programs</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Select or enter manually</p>
                  </div>
                </div>
                <select
                  value={selectedProgramId}
                  onChange={(e) => handleProgramSelect(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">-- Select a program --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title} - {program.country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="programName"
                value={formData.programName}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="e.g., Stipendium Hungaricum"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="programCountry"
                  value={formData.programCountry}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g., Hungary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  University/Institution
                </label>
                <input
                  type="text"
                  name="programUniversity"
                  value={formData.programUniversity}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="University name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="programDuration"
                  value={formData.programDuration}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g., 3 years"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="programStartDate"
                  value={formData.programStartDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="programEndDate"
                  value={formData.programEndDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                name="alternativePhone"
                value={formData.alternativePhone}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  State/Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Home Address Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Home Address</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Home Number
                  </label>
                  <input
                    type="text"
                    name="homeNumber"
                    value={formData.homeNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., Apt 123, House #45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Street Address
                  </label>
                  <textarea
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Street name and details"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Postal Address
                  </label>
                  <input
                    type="text"
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="P.O. Box or postal address"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                Please provide information about your parents or legal guardians
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-600 dark:text-pink-400" />
                </div>
                Mother's Information
              </h3>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Father's Information
              </h3>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
                </div>
                Emergency Contact
              </h3>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., Parent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Education History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Education History
                </h3>
                <button
                  type="button"
                  onClick={() => setEducation([...education, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }])}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {education.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No education history added yet. Click "Add" to add your education background.</p>
              )}

              {education.map((edu, index) => (
                <div key={index} className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-foreground">Education #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((_, i) => i !== index))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].institution = e.target.value;
                          setEducation(newEducation);
                        }}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="University/School name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Degree/Certificate</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].degree = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].fieldOfStudy = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Computer Science, Medicine, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].startDate = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].endDate = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Grade/GPA</label>
                        <input
                          type="text"
                          value={edu.grade}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].grade = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="3.5/4.0 or A"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Work Experience */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Work Experience
                </h3>
                <button
                  type="button"
                  onClick={() => setWorkExperience([...workExperience, { company: '', position: '', startDate: '', endDate: '', description: '', current: false }])}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {workExperience.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No work experience added yet. Click "Add" to add your work history.</p>
              )}

              {workExperience.map((work, index) => (
                <div key={index} className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-foreground">Experience #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== index))}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Company</label>
                        <input
                          type="text"
                          value={work.company}
                          onChange={(e) => {
                            const newWorkExperience = [...workExperience];
                            newWorkExperience[index].company = e.target.value;
                            setWorkExperience(newWorkExperience);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Position</label>
                        <input
                          type="text"
                          value={work.position}
                          onChange={(e) => {
                            const newWorkExperience = [...workExperience];
                            newWorkExperience[index].position = e.target.value;
                            setWorkExperience(newWorkExperience);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Job title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
                        <input
                          type="date"
                          value={work.startDate}
                          onChange={(e) => {
                            const newWorkExperience = [...workExperience];
                            newWorkExperience[index].startDate = e.target.value;
                            setWorkExperience(newWorkExperience);
                          }}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">End Date</label>
                        <input
                          type="date"
                          value={work.endDate}
                          onChange={(e) => {
                            const newWorkExperience = [...workExperience];
                            newWorkExperience[index].endDate = e.target.value;
                            setWorkExperience(newWorkExperience);
                          }}
                          disabled={work.current}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={work.current}
                        onChange={(e) => {
                          const newWorkExperience = [...workExperience];
                          newWorkExperience[index].current = e.target.checked;
                          if (e.target.checked) {
                            newWorkExperience[index].endDate = '';
                          }
                          setWorkExperience(newWorkExperience);
                        }}
                        className="w-4 h-4 rounded border-border"
                      />
                      <label htmlFor={`current-${index}`} className="text-xs text-foreground cursor-pointer">
                        Currently working here
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                      <textarea
                        value={work.description}
                        onChange={(e) => {
                          const newWorkExperience = [...workExperience];
                          newWorkExperience[index].description = e.target.value;
                          setWorkExperience(newWorkExperience);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        placeholder="Describe your responsibilities and achievements"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Passport Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Issuing Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="passportIssueCountry"
                value={formData.passportIssueCountry}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <input
                type="checkbox"
                name="previousTravel"
                checked={formData.previousTravel}
                onChange={handleChange}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border flex-shrink-0"
                id="previousTravel"
              />
              <label htmlFor="previousTravel" className="text-xs sm:text-sm font-medium text-foreground cursor-pointer">
                I have traveled internationally before
              </label>
            </div>

            {formData.previousTravel && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Previous Travel Details
                </label>
                <textarea
                  name="previousTravelDetails"
                  value={formData.previousTravelDetails}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  placeholder="Describe your travel experience"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Medical Conditions
              </label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Any medical conditions or allergies"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Special Requirements
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Dietary restrictions, accessibility needs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Why do you want to join this program?
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                placeholder="Your motivation and goals (optional)"
              />
            </div>
          </div>
        );

      case 8:
        const DocumentUploadCard = ({
          title,
          description,
          documentType,
          fieldName,
          required = false
        }: {
          title: string;
          description: string;
          documentType: string;
          fieldName: string;
          required?: boolean;
        }) => {
          const doc = documents[documentType];
          const fileInputId = `file-${documentType}`;

          return (
            <div className="bg-background border-2 border-border rounded-xl p-4 sm:p-6 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <span className="truncate">{title}</span>
                    {required && <span className="text-red-500 flex-shrink-0">*</span>}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
                </div>
                {doc ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                )}
              </div>

              {doc ? (
                <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-green-800 dark:text-green-300 truncate font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="View"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                    <button
                      onClick={() => handleRemoveDocument(documentType, fieldName)}
                      className="p-1.5 sm:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id={fileInputId}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, documentType, fieldName);
                      }
                    }}
                    disabled={uploading}
                  />
                  <label
                    htmlFor={fileInputId}
                    className={`flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      uploading
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin mb-2" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                        <span className="text-xs sm:text-sm font-semibold text-foreground">Click to upload</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 10MB)</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          );
        };

        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h3 className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">📄 Document Requirements</h3>
              <ul className="text-[10px] sm:text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Clear and legible documents</li>
                <li>PDF, JPG, PNG (Max 10MB)</li>
                <li><span className="text-red-500 font-bold">*</span> = Required</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DocumentUploadCard
                title="Passport Copy"
                description="Bio-data page"
                documentType="passport"
                fieldName="passportCopyUrl"
                required
              />

              <DocumentUploadCard
                title="Passport Photo"
                description="Recent passport photo"
                documentType="photo"
                fieldName="photoUrl"
                required
              />

              <DocumentUploadCard
                title="Birth Certificate"
                description="Official certificate"
                documentType="birthCertificate"
                fieldName="birthCertificateUrl"
                required
              />

              <DocumentUploadCard
                title="Transcripts"
                description="Academic transcripts"
                documentType="transcript"
                fieldName="transcriptUrl"
                required
              />

              <DocumentUploadCard
                title="WASSCE Results"
                description="Certificate results"
                documentType="wassce"
                fieldName="wassceUrl"
              />

              <DocumentUploadCard
                title="Medical Results"
                description="Medical certificate"
                documentType="medicalResults"
                fieldName="medicalResultsUrl"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
          <Link href="/profile/applications">
            <button className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">New Application</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">Study & Summer Programs Abroad</p>
          </div>
          
          {/* Mobile Steps Menu Button */}
          <button
            onClick={() => setShowStepsMenu(!showStepsMenu)}
            className="lg:hidden p-2 bg-primary text-white rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 sm:gap-8">
          {/* Desktop Sidebar - Vertical Steps */}
          <div className="w-64 xl:w-80 flex-shrink-0 hidden lg:block sticky top-4 sm:top-8 self-start">
            <div className="bg-card rounded-xl lg:rounded-2xl border-2 border-border p-4 sm:p-6 shadow-lg">
              <h2 className="text-base lg:text-lg font-bold text-foreground mb-4 sm:mb-6">Application Progress</h2>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = isStepComplete(step.number);
                  const isCurrent = currentStep === step.number;
                  const isPast = currentStep > step.number;

                  return (
                    <div key={step.number}>
                      <button
                        onClick={() => handleStepChange(step.number)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : isPast
                            ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCurrent
                              ? 'bg-white text-primary'
                              : isPast
                              ? 'bg-green-500 text-white'
                              : 'bg-background text-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className={`text-sm font-bold truncate ${isCurrent ? 'text-white' : isPast ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                            {step.title}
                          </div>
                          <div className={`text-xs truncate ${isCurrent ? 'text-white/80' : isPast ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                            {step.description}
                          </div>
                        </div>
                      </button>

                      {index < steps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <div className={`w-0.5 h-4 ${isPast ? 'bg-green-500' : 'bg-border'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Progress</span>
                  <span className="text-sm font-bold text-primary">
                    {Math.round((steps.filter((s) => isStepComplete(s.number)).length / steps.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{
                      width: `${(steps.filter((s) => isStepComplete(s.number)).length / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Steps Menu Overlay */}
          <AnimatePresence>
            {showStepsMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setShowStepsMenu(false)}
                />
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  className="fixed left-0 top-0 bottom-0 w-72 bg-card z-50 lg:hidden overflow-y-auto p-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-foreground">Steps</h2>
                    <button
                      onClick={() => setShowStepsMenu(false)}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = isStepComplete(step.number);
                      const isCurrent = currentStep === step.number;
                      const isPast = currentStep > step.number;

                      return (
                        <div key={step.number}>
                          <button
                            onClick={() => {
                              handleStepChange(step.number);
                              setShowStepsMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-primary text-white'
                                : isPast
                                ? 'bg-green-50 dark:bg-green-900/10'
                                : 'bg-muted/30'
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCurrent
                                  ? 'bg-white text-primary'
                                  : isPast
                                  ? 'bg-green-500 text-white'
                                  : 'bg-background text-muted-foreground'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <StepIcon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-bold ${isCurrent ? 'text-white' : isPast ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                                {step.title}
                              </div>
                              <div className={`text-xs ${isCurrent ? 'text-white/80' : isPast ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                {step.description}
                              </div>
                            </div>
                          </button>
                          {index < steps.length - 1 && (
                            <div className="flex justify-center py-1">
                              <div className={`w-0.5 h-4 ${isPast ? 'bg-green-500' : 'bg-border'}`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-xl lg:rounded-2xl border-2 border-border p-4 sm:p-6 lg:p-8 shadow-lg">
              {/* Mobile Step Indicator */}
              <div className="lg:hidden mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Step {currentStep} of {steps.length}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-foreground truncate">
                      {steps[currentStep - 1].title}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Title for Desktop */}
              <div className="hidden lg:block mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground">{steps[currentStep - 1].description}</p>
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border gap-3 sm:gap-4">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-muted text-foreground rounded-lg sm:rounded-xl font-semibold hover:bg-muted/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  Previous
                </button>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleSubmit('DRAFT')}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-background border-2 border-border text-foreground rounded-lg sm:rounded-xl font-semibold hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    <span className="hidden sm:inline">Save Draft</span>
                    <span className="sm:hidden">Draft</span>
                  </button>

                  {currentStep < steps.length ? (
                    <button
                      onClick={handleNext}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                    >
                      Next
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmit('SUBMITTED')}
                      disabled={loading || !canSubmit()}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span className="hidden sm:inline">Submit</span>
                      <span className="sm:hidden">Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
