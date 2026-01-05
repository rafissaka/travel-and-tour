'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Upload, 
  Trash2, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Application {
  id: string;
  programName: string;
  programCountry: string;
  programUniversity: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  nationality: string | null;
  sex: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  homeNumber: string | null;
  streetAddress: string | null;
  postalAddress: string | null;
  motherName: string | null;
  motherOccupation: string | null;
  motherPhone: string | null;
  fatherName: string | null;
  fatherOccupation: string | null;
  fatherPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  currentEducationLevel: string | null;
  schoolName: string | null;
  gradeLevel: string | null;
  gpa: string | null;
  education: any[] | null;
  workExperience: any[] | null;
  passportNumber: string | null;
  passportIssueDate: string | null;
  passportExpiryDate: string | null;
  passportCopyUrl: string | null;
  photoUrl: string | null;
  birthCertificateUrl: string | null;
  transcriptUrl: string | null;
  wassceUrl: string | null;
  medicalResultsUrl: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchApplication();

    // Check if edit mode should be enabled from query parameter
    const editParam = searchParams.get('edit');
    if (editParam === 'true') {
      setEditMode(true);
      // Remove the query parameter from URL
      router.replace(`/profile/applications/${applicationId}`);
    }
  }, [applicationId]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleGoBack = () => {
    // Admin users should go back to bookings page (applications tab)
    // Regular users go to their applications page
    if (isAdmin) {
      router.push('/profile/bookings?tab=applications');
    } else {
      router.push('/profile/applications');
    }
  };

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        setFormData(data);
      } else {
        toast.error('Application not found');
        handleGoBack();
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: applicationId, ...formData }),
      });

      if (response.ok) {
        toast.success('Application updated successfully');
        setEditMode(false);
        fetchApplication();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (field: string, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', field);

      const response = await fetch('/api/applications/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update application with new image URL
        const updateResponse = await fetch('/api/applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: applicationId, 
            [field]: data.url 
          }),
        });

        if (updateResponse.ok) {
          toast.success('Image uploaded successfully');
          fetchApplication();
        } else {
          toast.error('Failed to update application');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (field: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: applicationId, 
          [field]: null 
        }),
      });

      if (response.ok) {
        toast.success('Image deleted successfully');
        fetchApplication();
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: applicationId, 
          status: newStatus 
        }),
      });

      if (response.ok) {
        toast.success(`Application status changed to ${newStatus}`);
        setShowStatusChange(false);
        fetchApplication();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      DRAFT: { icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400', label: 'Draft' },
      SUBMITTED: { icon: Clock, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', label: 'Submitted' },
      UNDER_REVIEW: { icon: Clock, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400', label: 'Under Review' },
      APPROVED: { icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400', label: 'Approved' },
      REJECTED: { icon: XCircle, color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400', label: 'Rejected' },
    };

    const config = configs[status] || configs.DRAFT;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${config.color}`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        {config.label}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const canEdit = true; // Allow editing all applications

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-8 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              Application Details
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {application.programName} - {application.programCountry}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {getStatusBadge(application.status)}
          {isAdmin && !editMode && (
            <button
              onClick={() => setShowStatusChange(!showStatusChange)}
              className="px-3 py-2 sm:px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Change Status</span>
              <span className="sm:hidden">Status</span>
            </button>
          )}
          {canEdit && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 py-2 sm:px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {editMode && (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(application);
                }}
                className="px-3 py-2 sm:px-4 bg-background border-2 border-border text-foreground rounded-lg hover:bg-muted transition-all flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-2 sm:px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Status Change Section */}
      {isAdmin && showStatusChange && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Change Application Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <button
              onClick={() => handleStatusChange('DRAFT')}
              disabled={saving || application.status === 'DRAFT'}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Draft
            </button>
            <button
              onClick={() => handleStatusChange('SUBMITTED')}
              disabled={saving || application.status === 'SUBMITTED'}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submitted
            </button>
            <button
              onClick={() => handleStatusChange('UNDER_REVIEW')}
              disabled={saving || application.status === 'UNDER_REVIEW'}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Under Review
            </button>
            <button
              onClick={() => handleStatusChange('APPROVED')}
              disabled={saving || application.status === 'APPROVED'}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold hover:bg-green-200 dark:hover:bg-green-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approved
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              disabled={saving || application.status === 'REJECTED'}
              className="px-3 py-2 sm:px-4 sm:py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rejected
            </button>
          </div>
        </motion.div>
      )}

      {/* Client Info for Admin */}
      {isAdmin && application.user && (
        <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Client Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-semibold text-foreground">
                {application.user.firstName} {application.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <a href={`mailto:${application.user.email}`} className="font-semibold text-primary hover:underline">
                {application.user.email}
              </a>
            </div>
            {application.user.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <a href={`tel:${application.user.phone}`} className="font-semibold text-primary hover:underline">
                  {application.user.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="First Name" 
                value={formData.firstName} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, firstName: value })}
              />
              <InfoField 
                label="Last Name" 
                value={formData.lastName} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, lastName: value })}
              />
              <InfoField 
                label="Date of Birth" 
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'} 
                editMode={editMode}
                type="date"
                onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
              />
              <InfoField 
                label="Place of Birth" 
                value={formData.placeOfBirth} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, placeOfBirth: value })}
              />
              <InfoField 
                label="Nationality" 
                value={formData.nationality} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, nationality: value })}
              />
              <InfoField 
                label="Sex" 
                value={formData.sex} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, sex: value })}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField
                label="Email"
                value={formData.email}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, email: value })}
              />
              <InfoField
                label="Phone"
                value={formData.phone}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />
              <InfoField
                label="City"
                value={formData.city}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, city: value })}
                className="sm:col-span-2"
              />
              <InfoField
                label="Address"
                value={formData.address}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, address: value })}
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* Home Address */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Home Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField
                label="Home Number"
                value={formData.homeNumber}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, homeNumber: value })}
              />
              <InfoField
                label="Postal Address"
                value={formData.postalAddress}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, postalAddress: value })}
              />
              <InfoField
                label="Street Address"
                value={formData.streetAddress}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, streetAddress: value })}
                className="sm:col-span-2"
              />
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Family Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField
                label="Mother's Name"
                value={formData.motherName}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, motherName: value })}
                className="sm:col-span-2"
              />
              <InfoField
                label="Mother's Occupation"
                value={formData.motherOccupation}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, motherOccupation: value })}
              />
              <InfoField
                label="Mother's Phone"
                value={formData.motherPhone}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, motherPhone: value })}
              />
              <InfoField
                label="Father's Name"
                value={formData.fatherName}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, fatherName: value })}
                className="sm:col-span-2"
              />
              <InfoField
                label="Father's Occupation"
                value={formData.fatherOccupation}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, fatherOccupation: value })}
              />
              <InfoField
                label="Father's Phone"
                value={formData.fatherPhone}
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, fatherPhone: value })}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Contact Name" 
                value={formData.emergencyContactName} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, emergencyContactName: value })}
              />
              <InfoField 
                label="Contact Phone" 
                value={formData.emergencyContactPhone} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, emergencyContactPhone: value })}
              />
              <InfoField 
                label="Relationship" 
                value={formData.emergencyContactRelation} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, emergencyContactRelation: value })}
              />
            </div>
          </div>

          {/* Education History */}
          {formData.education && Array.isArray(formData.education) && formData.education.length > 0 && (
            <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Education History</h2>
              <div className="space-y-4">
                {formData.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {edu.degree && (
                      <p className="font-bold text-foreground text-lg">
                        <span className="text-muted-foreground text-sm font-normal">Degree: </span>
                        {edu.degree}
                      </p>
                    )}
                    {edu.institution && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Institution: </span>
                        <span className="font-semibold text-foreground">{edu.institution}</span>
                      </p>
                    )}
                    {edu.fieldOfStudy && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Field: </span>
                        <span className="text-foreground">{edu.fieldOfStudy}</span>
                      </p>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="text-foreground">{edu.startDate} - {edu.endDate || 'Present'}</span>
                      </p>
                    )}
                    {edu.grade && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">CWA: </span>
                        <span className="text-foreground">{edu.grade}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {formData.workExperience && Array.isArray(formData.workExperience) && formData.workExperience.length > 0 && (
            <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Work Experience</h2>
              <div className="space-y-4">
                {formData.workExperience.map((work: any, index: number) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {work.company && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Company: </span>
                        <span className="font-semibold text-foreground">{work.company}</span>
                      </p>
                    )}
                    {work.position && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Position: </span>
                        <span className="text-foreground">{work.position}</span>
                      </p>
                    )}
                    {work.location && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Location: </span>
                        <span className="text-foreground">{work.location}</span>
                      </p>
                    )}
                    {(work.startDate || work.endDate) && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="text-foreground">{work.startDate} - {work.endDate || 'Present'}</span>
                      </p>
                    )}
                    {work.description && (
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">Description: </span>
                        <span className="text-foreground">{work.description}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passport Information */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Passport Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Passport Number" 
                value={formData.passportNumber} 
                editMode={editMode}
                onChange={(value) => setFormData({ ...formData, passportNumber: value })}
              />
              <InfoField 
                label="Issue Date" 
                value={formData.passportIssueDate ? new Date(formData.passportIssueDate).toLocaleDateString() : 'Not provided'} 
                editMode={editMode}
                type="date"
                onChange={(value) => setFormData({ ...formData, passportIssueDate: value })}
              />
              <InfoField 
                label="Expiry Date" 
                value={formData.passportExpiryDate ? new Date(formData.passportExpiryDate).toLocaleDateString() : 'Not provided'} 
                editMode={editMode}
                type="date"
                onChange={(value) => setFormData({ ...formData, passportExpiryDate: value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Documents */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              Documents
            </h2>

            <div className="space-y-4">
              <DocumentUpload
                label="Passport Copy"
                description="Bio-data page"
                imageUrl={application.passportCopyUrl}
                onUpload={(file) => handleImageUpload('passportCopyUrl', file)}
                onDelete={() => handleDeleteImage('passportCopyUrl')}
                uploading={uploading}
                canEdit={canEdit}
                required
              />

              <DocumentUpload
                label="Passport Photo"
                description="Recent passport photo (2x2 inches, square, 600x600px minimum)"
                imageUrl={application.photoUrl}
                onUpload={(file) => handleImageUpload('photoUrl', file)}
                onDelete={() => handleDeleteImage('photoUrl')}
                uploading={uploading}
                canEdit={canEdit}
                required
              />

              <DocumentUpload
                label="Birth Certificate"
                description="Official certificate"
                imageUrl={application.birthCertificateUrl}
                onUpload={(file) => handleImageUpload('birthCertificateUrl', file)}
                onDelete={() => handleDeleteImage('birthCertificateUrl')}
                uploading={uploading}
                canEdit={canEdit}
                required
              />

              <DocumentUpload
                label="Transcripts"
                description="Academic transcripts"
                imageUrl={application.transcriptUrl}
                onUpload={(file) => handleImageUpload('transcriptUrl', file)}
                onDelete={() => handleDeleteImage('transcriptUrl')}
                uploading={uploading}
                canEdit={canEdit}
                required
              />

              <DocumentUpload
                label="WASSCE Results"
                description="Certificate results (optional)"
                imageUrl={application.wassceUrl}
                onUpload={(file) => handleImageUpload('wassceUrl', file)}
                onDelete={() => handleDeleteImage('wassceUrl')}
                uploading={uploading}
                canEdit={canEdit}
              />

              <DocumentUpload
                label="Medical Results"
                description="Medical certificate (optional)"
                imageUrl={application.medicalResultsUrl}
                onUpload={(file) => handleImageUpload('medicalResultsUrl', file)}
                onDelete={() => handleDeleteImage('medicalResultsUrl')}
                uploading={uploading}
                canEdit={canEdit}
              />
            </div>
          </div>

          {/* Application Meta */}
          <div className="bg-card rounded-xl border-2 border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">Application Status</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium text-foreground">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              {application.submittedAt && (
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p className="font-medium text-foreground">
                    {new Date(application.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoField({
  label,
  value,
  editMode,
  type = 'text',
  onChange,
  className = ''
}: {
  label: string;
  value: any;
  editMode: boolean;
  type?: string;
  onChange?: (value: any) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {editMode ? (
        <>
          <label className="block text-sm font-semibold text-muted-foreground mb-1">
            {label}
          </label>
          <input
            type={type}
            value={type === 'date' && value ? value.split('T')[0] : (value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </>
      ) : (
        <p className="text-sm">
          <span className="text-muted-foreground">{label}: </span>
          <span className="text-foreground font-medium">{value || 'Not provided'}</span>
        </p>
      )}
    </div>
  );
}

function DocumentUpload({
  label,
  description,
  imageUrl,
  onUpload,
  onDelete,
  uploading,
  canEdit,
  required = false
}: {
  label: string;
  description?: string;
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  uploading: boolean;
  canEdit: boolean;
  required?: boolean;
}) {
  const fileInputId = `file-${label.replace(/\s/g, '-')}`;
  const isPDF = imageUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="border-2 border-border rounded-lg p-4">
      <div className="mb-2">
        <h3 className="font-semibold text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {imageUrl ? (
        <div className="space-y-2">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {isPDF ? (
              <div className="flex items-center justify-center h-full">
                <FileText className="w-16 h-16 text-primary" />
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={label}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            {canEdit && (
              <button
                onClick={onDelete}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {canEdit ? (
            <div>
              <input
                id={fileInputId}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor={fileInputId}
                className="block w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all cursor-pointer text-center text-sm"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </span>
                )}
              </label>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No document uploaded
            </p>
          )}
        </>
      )}
    </div>
  );
}
