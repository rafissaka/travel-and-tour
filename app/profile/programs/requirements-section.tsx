'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Save, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface RequirementsProps {
  programId: string;
  programTitle: string;
}

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

const DOCUMENT_TYPES = [
  // Educational Documents
  { value: 'WASSCE_RESULT', label: 'WASSCE Results', category: 'Educational' },
  { value: 'BECE_RESULT', label: 'BECE Results', category: 'Educational' },
  { value: 'JHS_TRANSCRIPT', label: 'JHS Transcript', category: 'Educational' },
  { value: 'SHS_TRANSCRIPT', label: 'SHS Transcript', category: 'Educational' },
  { value: 'UNIVERSITY_TRANSCRIPT', label: 'University Transcript', category: 'Educational' },
  { value: 'DEGREE_CERTIFICATE', label: 'Degree Certificate', category: 'Educational' },
  { value: 'DIPLOMA_CERTIFICATE', label: 'Diploma Certificate', category: 'Educational' },
  { value: 'ACADEMIC_REFERENCE_LETTER', label: 'Academic Reference Letter', category: 'Educational' },
  
  // Identity Documents
  { value: 'PASSPORT_COPY', label: 'Passport Copy', category: 'Identity' },
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', category: 'Identity' },
  { value: 'NATIONAL_ID', label: 'National ID (Ghana Card)', category: 'Identity' },
  { value: 'PASSPORT_PHOTO', label: 'Passport Photo', category: 'Identity' },
  
  // Test Scores
  { value: 'TOEFL_SCORE', label: 'TOEFL Score Report', category: 'Test Scores' },
  { value: 'IELTS_SCORE', label: 'IELTS Score Report', category: 'Test Scores' },
  { value: 'DUOLINGO_SCORE', label: 'Duolingo Score Report', category: 'Test Scores' },
  { value: 'PTE_SCORE', label: 'PTE Score Report', category: 'Test Scores' },
  { value: 'SAT_SCORE', label: 'SAT Score Report', category: 'Test Scores' },
  { value: 'ACT_SCORE', label: 'ACT Score Report', category: 'Test Scores' },
  { value: 'GRE_SCORE', label: 'GRE Score Report', category: 'Test Scores' },
  { value: 'GMAT_SCORE', label: 'GMAT Score Report', category: 'Test Scores' },
  
  // Application Documents
  { value: 'STATEMENT_OF_PURPOSE', label: 'Statement of Purpose', category: 'Application' },
  { value: 'PERSONAL_STATEMENT', label: 'Personal Statement', category: 'Application' },
  { value: 'MOTIVATION_LETTER', label: 'Motivation Letter', category: 'Application' },
  { value: 'CV_RESUME', label: 'CV/Resume', category: 'Application' },
  
  // Financial Documents
  { value: 'BANK_STATEMENT', label: 'Bank Statement', category: 'Financial' },
  { value: 'SPONSOR_LETTER', label: 'Sponsor Letter', category: 'Financial' },
  
  // Other
  { value: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate', category: 'Other' },
  { value: 'POLICE_CLEARANCE', label: 'Police Clearance', category: 'Other' },
  { value: 'WORK_EXPERIENCE_LETTER', label: 'Work Experience Letter', category: 'Other' },
];

const GRADING_SYSTEMS = [
  { value: 'PERCENTAGE', label: 'Percentage (0-100%)' },
  { value: 'GPA_4', label: 'GPA (0.0-4.0)' },
  { value: 'GPA_5', label: 'GPA (0.0-5.0)' },
  { value: 'CGPA_10', label: 'CGPA (0.0-10.0)' },
  { value: 'WASSCE', label: 'WASSCE Grades' },
  { value: 'FIRST_CLASS', label: 'Class System' },
];

export default function RequirementsSection({ programId, programTitle }: RequirementsProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasRequirements, setHasRequirements] = useState(false);

  // Form state
  const [acceptedEducationLevels, setAcceptedEducationLevels] = useState<string[]>([]);
  const [minimumGpa, setMinimumGpa] = useState('');
  const [gradingSystem, setGradingSystem] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [toeflMinimum, setToeflMinimum] = useState('');
  const [ieltsMinimum, setIeltsMinimum] = useState('');
  const [duolingoMinimum, setDuolingoMinimum] = useState('');
  const [pteMinimum, setPteMinimum] = useState('');
  const [satMinimum, setSatMinimum] = useState('');
  const [actMinimum, setActMinimum] = useState('');
  const [greMinimum, setGreMinimum] = useState('');
  const [gmatMinimum, setGmatMinimum] = useState('');
  const [workExperienceRequired, setWorkExperienceRequired] = useState(false);
  const [minimumWorkExperienceYears, setMinimumWorkExperienceYears] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  // Institutional Requirements
  const [acceptedInstitutions, setAcceptedInstitutions] = useState<string[]>([]);
  const [institutionInput, setInstitutionInput] = useState('');
  const [acceptedCourses, setAcceptedCourses] = useState<string[]>([]);
  const [courseInput, setCourseInput] = useState('');
  const [acceptedFundingTypes, setAcceptedFundingTypes] = useState<string[]>([]);
  const [requireCompletionDate, setRequireCompletionDate] = useState(false);
  const [minimumStudyDurationMonths, setMinimumStudyDurationMonths] = useState('');

  useEffect(() => {
    if (showForm) {
      fetchRequirements();
    }
  }, [showForm]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/programs/${programId}/requirements`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const req = data[0];
          setHasRequirements(true);
          setAcceptedEducationLevels(req.acceptedEducationLevels || []);
          setMinimumGpa(req.minimumGpa?.toString() || '');
          setGradingSystem(req.gradingSystem || '');
          setRequiredDocuments(req.requiredDocuments || []);
          setToeflMinimum(req.toeflMinimum?.toString() || '');
          setIeltsMinimum(req.ieltsMinimum?.toString() || '');
          setDuolingoMinimum(req.duolingoMinimum?.toString() || '');
          setPteMinimum(req.pteMinimum?.toString() || '');
          setSatMinimum(req.satMinimum?.toString() || '');
          setActMinimum(req.actMinimum?.toString() || '');
          setGreMinimum(req.greMinimum?.toString() || '');
          setGmatMinimum(req.gmatMinimum?.toString() || '');
          setWorkExperienceRequired(req.workExperienceRequired || false);
          setMinimumWorkExperienceYears(req.minimumWorkExperienceYears?.toString() || '');
          setAdditionalRequirements(req.additionalRequirements || '');
          setAcceptedInstitutions(req.acceptedInstitutions || []);
          setAcceptedCourses(req.acceptedCourses || []);
          setAcceptedFundingTypes(req.acceptedFundingTypes || []);
          setRequireCompletionDate(req.requireCompletionDate || false);
          setMinimumStudyDurationMonths(req.minimumStudyDurationMonths?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast.error('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (acceptedEducationLevels.length === 0) {
      toast.error('Please select at least one education level');
      return;
    }

    if (requiredDocuments.length === 0) {
      toast.error('Please select at least one required document');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        acceptedEducationLevels,
        minimumGpa: minimumGpa ? parseFloat(minimumGpa) : null,
        gradingSystem: gradingSystem || null,
        requiredDocuments,
        toeflMinimum: toeflMinimum ? parseInt(toeflMinimum) : null,
        ieltsMinimum: ieltsMinimum ? parseFloat(ieltsMinimum) : null,
        duolingoMinimum: duolingoMinimum ? parseInt(duolingoMinimum) : null,
        pteMinimum: pteMinimum ? parseInt(pteMinimum) : null,
        satMinimum: satMinimum ? parseInt(satMinimum) : null,
        actMinimum: actMinimum ? parseInt(actMinimum) : null,
        greMinimum: greMinimum ? parseInt(greMinimum) : null,
        gmatMinimum: gmatMinimum ? parseInt(gmatMinimum) : null,
        workExperienceRequired,
        minimumWorkExperienceYears: minimumWorkExperienceYears ? parseInt(minimumWorkExperienceYears) : null,
        additionalRequirements: additionalRequirements || null,
        acceptedInstitutions: acceptedInstitutions.length > 0 ? acceptedInstitutions : null,
        acceptedCourses: acceptedCourses.length > 0 ? acceptedCourses : null,
        acceptedFundingTypes: acceptedFundingTypes.length > 0 ? acceptedFundingTypes : null,
        requireCompletionDate,
        minimumStudyDurationMonths: minimumStudyDurationMonths ? parseInt(minimumStudyDurationMonths) : null,
      };

      const method = hasRequirements ? 'PATCH' : 'POST';
      const response = await fetch(`/api/programs/${programId}/requirements`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(hasRequirements ? 'Requirements updated successfully' : 'Requirements created successfully');
        setHasRequirements(true);
        setShowForm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save requirements');
      }
    } catch (error) {
      console.error('Error saving requirements:', error);
      toast.error('Failed to save requirements');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete these requirements?')) return;

    try {
      const response = await fetch(`/api/programs/${programId}/requirements`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Requirements deleted successfully');
        setHasRequirements(false);
        setShowForm(false);
        // Reset form
        setAcceptedEducationLevels([]);
        setMinimumGpa('');
        setGradingSystem('');
        setRequiredDocuments([]);
        setToeflMinimum('');
        setIeltsMinimum('');
        setDuolingoMinimum('');
        setPteMinimum('');
        setSatMinimum('');
        setActMinimum('');
        setGreMinimum('');
        setGmatMinimum('');
        setWorkExperienceRequired(false);
        setMinimumWorkExperienceYears('');
        setAdditionalRequirements('');
      } else {
        toast.error('Failed to delete requirements');
      }
    } catch (error) {
      console.error('Error deleting requirements:', error);
      toast.error('Failed to delete requirements');
    }
  };

  const toggleDocument = (docValue: string) => {
    if (requiredDocuments.includes(docValue)) {
      setRequiredDocuments(requiredDocuments.filter(d => d !== docValue));
    } else {
      setRequiredDocuments([...requiredDocuments, docValue]);
    }
  };

  // Group documents by category
  const groupedDocuments = DOCUMENT_TYPES.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof DOCUMENT_TYPES>);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{hasRequirements ? 'Edit' : 'Set'} Eligibility Requirements</span>
        </button>
        
        {hasRequirements && (
          <span className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-full">
            <CheckCircle className="w-4 h-4" />
            Requirements Set
          </span>
        )}
      </div>

      {showForm && (
        <div className="bg-accent/5 border border-border rounded-lg p-3 sm:p-5 space-y-3 sm:space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Eligibility Requirements for {programTitle}</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Set the requirements users must meet to be eligible for this program. These will be used to calculate eligibility scores.
                </p>
              </div>

              {/* Education Levels */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Accepted Education Levels * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 sm:p-3 bg-background border border-border rounded-lg">
                  {EDUCATION_LEVELS.map((level) => (
                    <label key={level.value} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={acceptedEducationLevels.includes(level.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAcceptedEducationLevels([...acceptedEducationLevels, level.value]);
                          } else {
                            setAcceptedEducationLevels(acceptedEducationLevels.filter(l => l !== level.value));
                          }
                        }}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">{level.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {acceptedEducationLevels.length} level(s)
                </p>
              </div>

              {/* GPA Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum GPA (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={minimumGpa}
                    onChange={(e) => setMinimumGpa(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 3.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Grading System
                  </label>
                  <select
                    value={gradingSystem}
                    onChange={(e) => setGradingSystem(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select grading system</option>
                    {GRADING_SYSTEMS.map((system) => (
                      <option key={system.value} value={system.value}>
                        {system.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Required Documents * (Select all that apply)
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto p-2 sm:p-3 bg-background border border-border rounded-lg">
                  {Object.entries(groupedDocuments).map(([category, docs]) => (
                    <div key={category}>
                      <h5 className="font-semibold text-foreground mb-2 text-sm">{category}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {docs.map((doc) => (
                          <label key={doc.value} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={requiredDocuments.includes(doc.value)}
                              onChange={() => toggleDocument(doc.value)}
                              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">{doc.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {requiredDocuments.length} document(s)
                </p>
              </div>

              {/* Test Score Requirements */}
              <div>
                <h5 className="font-semibold text-foreground mb-3">Test Score Requirements (Optional)</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      TOEFL
                    </label>
                    <input
                      type="number"
                      value={toeflMinimum}
                      onChange={(e) => setToeflMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      IELTS
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={ieltsMinimum}
                      onChange={(e) => setIeltsMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 6.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Duolingo
                    </label>
                    <input
                      type="number"
                      value={duolingoMinimum}
                      onChange={(e) => setDuolingoMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 110"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      PTE
                    </label>
                    <input
                      type="number"
                      value={pteMinimum}
                      onChange={(e) => setPteMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 58"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      SAT
                    </label>
                    <input
                      type="number"
                      value={satMinimum}
                      onChange={(e) => setSatMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 1200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      ACT
                    </label>
                    <input
                      type="number"
                      value={actMinimum}
                      onChange={(e) => setActMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GRE
                    </label>
                    <input
                      type="number"
                      value={greMinimum}
                      onChange={(e) => setGreMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GMAT
                    </label>
                    <input
                      type="number"
                      value={gmatMinimum}
                      onChange={(e) => setGmatMinimum(e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 550"
                    />
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h5 className="font-semibold text-foreground mb-3">Work Experience</h5>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workExperienceRequired}
                      onChange={(e) => setWorkExperienceRequired(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Work experience required</span>
                  </label>

                  {workExperienceRequired && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Minimum Years of Experience
                      </label>
                      <input
                        type="number"
                        value={minimumWorkExperienceYears}
                        onChange={(e) => setMinimumWorkExperienceYears(e.target.value)}
                        className="w-full sm:w-48 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., 2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Institutional Requirements */}
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2 sm:space-y-3">
                <div>
                  <h5 className="font-semibold text-foreground text-sm sm:text-base">Institutional Requirements</h5>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    These match the institutional information users provide when uploading documents
                  </p>
                </div>

                {/* Accepted Institutions */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accepted Institutions/Schools (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={institutionInput}
                        onChange={(e) => setInstitutionInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && institutionInput.trim()) {
                            e.preventDefault();
                            if (!acceptedInstitutions.includes(institutionInput.trim())) {
                              setAcceptedInstitutions([...acceptedInstitutions, institutionInput.trim()]);
                              setInstitutionInput('');
                            }
                          }
                        }}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Achimota School"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (institutionInput.trim() && !acceptedInstitutions.includes(institutionInput.trim())) {
                            setAcceptedInstitutions([...acceptedInstitutions, institutionInput.trim()]);
                            setInstitutionInput('');
                          }
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {acceptedInstitutions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {acceptedInstitutions.map((inst, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                          >
                            {inst}
                            <button
                              type="button"
                              onClick={() => setAcceptedInstitutions(acceptedInstitutions.filter((_, i) => i !== idx))}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty to accept all institutions. Add specific schools to restrict eligibility.
                    </p>
                  </div>
                </div>

                {/* Accepted Courses */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accepted Courses/Programs (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={courseInput}
                        onChange={(e) => setCourseInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && courseInput.trim()) {
                            e.preventDefault();
                            if (!acceptedCourses.includes(courseInput.trim())) {
                              setAcceptedCourses([...acceptedCourses, courseInput.trim()]);
                              setCourseInput('');
                            }
                          }
                        }}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., General Science"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (courseInput.trim() && !acceptedCourses.includes(courseInput.trim())) {
                            setAcceptedCourses([...acceptedCourses, courseInput.trim()]);
                            setCourseInput('');
                          }
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    {acceptedCourses.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {acceptedCourses.map((course, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                          >
                            {course}
                            <button
                              type="button"
                              onClick={() => setAcceptedCourses(acceptedCourses.filter((_, i) => i !== idx))}
                              className="hover:text-red-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty to accept all courses. Add specific programs to restrict eligibility.
                    </p>
                  </div>
                </div>

                {/* Accepted Funding Types */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Accepted Funding Types (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {['FREE', 'PAID', 'STATE_FUNDED', 'SCHOLARSHIP', 'SPONSORSHIP'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={acceptedFundingTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAcceptedFundingTypes([...acceptedFundingTypes, type]);
                            } else {
                              setAcceptedFundingTypes(acceptedFundingTypes.filter(t => t !== type));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{type.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Leave empty to accept all funding types.
                  </p>
                </div>

                {/* Study Duration */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Study Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={minimumStudyDurationMonths}
                    onChange={(e) => setMinimumStudyDurationMonths(e.target.value)}
                    className="w-full sm:w-48 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 36 (3 years)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculated from start date to end date in user's document
                  </p>
                </div>

                {/* Completion Date Required */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireCompletionDate}
                      onChange={(e) => setRequireCompletionDate(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">Require completion/graduation date</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    User must have completed their studies (not currently enrolled)
                  </p>
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  rows={3}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Any other specific requirements..."
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-border">
                {hasRequirements && (
                  <button
                    onClick={handleDelete}
                    className="w-full sm:w-auto px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Requirements</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
