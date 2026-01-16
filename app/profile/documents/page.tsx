'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Trash2, Eye, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FileUpload from '@/app/components/FileUpload';
import PageLoader from '@/app/components/PageLoader';

interface Document {
  id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  documentNumber: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

const DOCUMENT_TYPES = {
  // Educational Documents
  EDUCATIONAL: [
    { value: 'WASSCE_RESULT', label: 'WASSCE Results' },
    { value: 'BECE_RESULT', label: 'BECE Results' },
    { value: 'JHS_TRANSCRIPT', label: 'JHS Transcript' },
    { value: 'SHS_TRANSCRIPT', label: 'SHS Transcript' },
    { value: 'UNIVERSITY_TRANSCRIPT', label: 'University Transcript' },
    { value: 'DEGREE_CERTIFICATE', label: 'Degree Certificate' },
    { value: 'DIPLOMA_CERTIFICATE', label: 'Diploma Certificate' },
    { value: 'ACADEMIC_REFERENCE_LETTER', label: 'Academic Reference Letter' },
  ],
  // Identity Documents
  IDENTITY: [
    { value: 'PASSPORT_COPY', label: 'Passport Copy' },
    { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
    { value: 'NATIONAL_ID', label: 'National ID (Ghana Card)' },
    { value: 'PASSPORT_PHOTO', label: 'Passport Photo' },
  ],
  // Test Scores
  TEST_SCORES: [
    { value: 'TOEFL_SCORE', label: 'TOEFL Score Report' },
    { value: 'IELTS_SCORE', label: 'IELTS Score Report' },
    { value: 'DUOLINGO_SCORE', label: 'Duolingo Score Report' },
    { value: 'PTE_SCORE', label: 'PTE Score Report' },
    { value: 'SAT_SCORE', label: 'SAT Score Report' },
    { value: 'ACT_SCORE', label: 'ACT Score Report' },
    { value: 'GRE_SCORE', label: 'GRE Score Report' },
    { value: 'GMAT_SCORE', label: 'GMAT Score Report' },
  ],
  // Application Documents
  APPLICATION: [
    { value: 'STATEMENT_OF_PURPOSE', label: 'Statement of Purpose' },
    { value: 'PERSONAL_STATEMENT', label: 'Personal Statement' },
    { value: 'MOTIVATION_LETTER', label: 'Motivation Letter' },
    { value: 'CV_RESUME', label: 'CV/Resume' },
    { value: 'PORTFOLIO', label: 'Portfolio' },
    { value: 'RESEARCH_PROPOSAL', label: 'Research Proposal' },
  ],
  // Financial Documents
  FINANCIAL: [
    { value: 'BANK_STATEMENT', label: 'Bank Statement' },
    { value: 'SPONSOR_LETTER', label: 'Sponsor Letter' },
    { value: 'SCHOLARSHIP_LETTER', label: 'Scholarship Letter' },
    { value: 'FINANCIAL_GUARANTEE', label: 'Financial Guarantee' },
  ],
  // Medical & Legal
  MEDICAL_LEGAL: [
    { value: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate' },
    { value: 'VACCINATION_RECORD', label: 'Vaccination Record' },
    { value: 'POLICE_CLEARANCE', label: 'Police Clearance' },
    { value: 'CHARACTER_REFERENCE', label: 'Character Reference' },
  ],
  // Other
  OTHER: [
    { value: 'WORK_EXPERIENCE_LETTER', label: 'Work Experience Letter' },
    { value: 'INTERNSHIP_CERTIFICATE', label: 'Internship Certificate' },
    { value: 'EXTRACURRICULAR_CERTIFICATE', label: 'Extracurricular Certificate' },
    { value: 'OTHER', label: 'Other Document' },
  ],
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  
  // Institutional Information (for educational documents)
  const [institutionName, setInstitutionName] = useState('');
  const [courseOfStudy, setCourseOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleMigrate = async () => {
    if (!confirm('This will scan ALL your uploaded documents and create education entries automatically. Continue?')) {
      return;
    }

    setMigrating(true);
    try {
      const response = await fetch('/api/education-history/migrate', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Migration result:', result);

        if (result.created && result.created.length > 0) {
          toast.success(`✅ Created ${result.created.length} education entries! Now you can use "Auto-fill" in the application form.`);
        } else {
          toast.info(`No new education entries created. ${result.skipped?.length || 0} documents skipped (already exist or not educational).`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Migration failed');
      }
    } catch (error) {
      console.error('Error migrating:', error);
      toast.error('Failed to migrate documents');
    } finally {
      setMigrating(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/user/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        toast.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentType || !documentName || !fileUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentName,
          fileUrl,
          issueDate: issueDate || null,
          expiryDate: expiryDate || null,
          issuingAuthority: issuingAuthority || null,
          documentNumber: documentNumber || null,
          institutionName: institutionName || null,
          courseOfStudy: courseOfStudy || null,
          startDate: startDate || null,
          endDate: endDate || null,
          completionDate: completionDate || null,
          fundingType: fundingType || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.educationCreated) {
          toast.success('Document uploaded and education history created! Check your Academic Profile.');
        } else {
          toast.success('Document uploaded successfully!');
        }
        setShowUploadForm(false);
        resetForm();
        fetchDocuments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/user/documents?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const resetForm = () => {
    setDocumentType('');
    setDocumentName('');
    setFileUrl('');
    setIssueDate('');
    setExpiryDate('');
    setIssuingAuthority('');
    setDocumentNumber('');
    setInstitutionName('');
    setCourseOfStudy('');
    setStartDate('');
    setEndDate('');
    setCompletionDate('');
    setFundingType('');
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    const category = Object.entries(DOCUMENT_TYPES).find(([_, types]) => 
      types.some(t => t.value === doc.documentType)
    )?.[0] || 'OTHER';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Documents</h1>
            <p className="text-sm text-muted-foreground">Upload and manage your academic documents</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {migrating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                Create Education Entries
              </>
            )}
          </button>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Upload New Document</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select document type</option>
                  {Object.entries(DOCUMENT_TYPES).map(([category, types]) => (
                    <optgroup key={category} label={category.replace(/_/g, ' ')}>
                      {types.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Name *
                </label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g., WASSCE Certificate 2019"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <FileUpload
                  label="Upload Document File"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  maxSizeMB={10}
                  bucketName="documents"
                  folder="user-documents"
                  onUploadComplete={(url, fileName, fileSize) => {
                    setFileUrl(url);
                    if (!documentName) {
                      setDocumentName(fileName);
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  placeholder="e.g., WAEC, University of Ghana"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g., Passport number, Certificate ID"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Institutional Information - Only show for educational documents */}
            {documentType && DOCUMENT_TYPES.EDUCATIONAL.some(doc => doc.value === documentType) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg space-y-4">
                <h4 className="font-semibold text-foreground mb-3">Institutional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Institution/School Name
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="e.g., Achimota School, University of Ghana"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Course/Program of Study
                    </label>
                    <input
                      type="text"
                      value={courseOfStudy}
                      onChange={(e) => setCourseOfStudy(e.target.value)}
                      placeholder="e.g., General Science, Business Administration"
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Completion/Graduation Date
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Funding Type
                    </label>
                    <select
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select funding type</option>
                      <option value="FREE">Free Education</option>
                      <option value="PAID">Paid/Self-Funded</option>
                      <option value="STATE_FUNDED">State/Government Funded</option>
                      <option value="SCHOLARSHIP">Scholarship</option>
                      <option value="SPONSORSHIP">Sponsorship</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Documents List */}
      {loading ? (
        <PageLoader text="Loading documents..." />
      ) : documents.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Documents Yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload your academic documents to start discovering programs you qualify for
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-foreground mb-4">
                {category.replace(/_/g, ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <h4 className="font-semibold text-foreground truncate">{doc.documentName}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDocumentType(doc.documentType)}
                        </p>
                        <div className="flex items-center gap-2">
                          {doc.isVerified ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
