'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit, Trash2, Loader2, BookOpen, Award, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface AcademicProfile {
  id: string;
  currentEducationLevel: string | null;
  highestEducationLevel: string | null;
  intendedStudyLevel: string | null;
  fieldOfStudy: string | null;
  preferredCountries: string[] | null;
  educationHistory: EducationHistory[];
  testScores: TestScore[];
}

interface EducationHistory {
  id: string;
  institutionName: string;
  institutionCountry: string | null;
  educationLevel: string;
  fieldOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  grade: string | null;
  gradingSystem: string | null;
  graduated: boolean;
}

interface TestScore {
  id: string;
  testType: string;
  testDate: string | null;
  overallScore: string | null;
  readingScore: string | null;
  writingScore: string | null;
  listeningScore: string | null;
  speakingScore: string | null;
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

const TEST_TYPES = [
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'IELTS', label: 'IELTS' },
  { value: 'DUOLINGO', label: 'Duolingo English Test' },
  { value: 'PTE', label: 'PTE Academic' },
  { value: 'SAT', label: 'SAT' },
  { value: 'ACT', label: 'ACT' },
  { value: 'GRE', label: 'GRE' },
  { value: 'GMAT', label: 'GMAT' },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Sweden', 'Denmark', 'Ireland', 'New Zealand', 
  'Singapore', 'Switzerland', 'Japan', 'South Korea', 'Ghana'
];

export default function AcademicProfilePage() {
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Profile form state
  const [currentEducationLevel, setCurrentEducationLevel] = useState('');
  const [highestEducationLevel, setHighestEducationLevel] = useState('');
  const [intendedStudyLevel, setIntendedStudyLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [otherCountry, setOtherCountry] = useState('');

  // Education form state
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionCountry, setInstitutionCountry] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [educationFieldOfStudy, setEducationFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [grade, setGrade] = useState('');
  const [gradingSystem, setGradingSystem] = useState('');
  const [graduated, setGraduated] = useState(false);

  // Test score form state
  const [showTestScoreForm, setShowTestScoreForm] = useState(false);
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [overallScore, setOverallScore] = useState('');
  const [readingScore, setReadingScore] = useState('');
  const [writingScore, setWritingScore] = useState('');
  const [listeningScore, setListeningScore] = useState('');
  const [speakingScore, setSpeakingScore] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAutoFillFromDocuments = async () => {
    setAutoFilling(true);
    try {
      const response = await fetch('/api/education-history/auto-fill', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.created && result.created.length > 0) {
          toast.success(`Created ${result.created.length} education entries from your documents!`);
          fetchProfile();
        } else {
          toast.info('No new education entries created. Upload documents first or entries may already exist.');
        }
      } else {
        toast.error('Failed to auto-fill from documents');
      }
    } catch (error) {
      console.error('Error auto-filling:', error);
      toast.error('Failed to auto-fill from documents');
    } finally {
      setAutoFilling(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('This will scan ALL your uploaded documents and create education entries. Continue?')) {
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
          toast.success(`✅ Migration complete! Created ${result.created.length} education entries from ${result.totalDocuments} documents.`);
          fetchProfile();
        } else {
          toast.info(`No new education entries created. Skipped: ${result.skipped?.length || 0} documents.`);
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

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/academic-profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Set form values
        setCurrentEducationLevel(data.currentEducationLevel || '');
        setHighestEducationLevel(data.highestEducationLevel || '');
        setIntendedStudyLevel(data.intendedStudyLevel || '');
        setFieldOfStudy(data.fieldOfStudy || '');
        setPreferredCountries(data.preferredCountries || []);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/academic-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEducationLevel: currentEducationLevel || null,
          highestEducationLevel: highestEducationLevel || null,
          intendedStudyLevel: intendedStudyLevel || null,
          fieldOfStudy: fieldOfStudy || null,
          preferredCountries,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/user/education-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName,
          institutionCountry: institutionCountry || null,
          educationLevel,
          fieldOfStudy: educationFieldOfStudy || null,
          startDate: startDate || null,
          endDate: endDate || null,
          isCurrent,
          grade: grade || null,
          gradingSystem: gradingSystem || null,
          graduated,
        }),
      });

      if (response.ok) {
        toast.success('Education added successfully!');
        setShowEducationForm(false);
        resetEducationForm();
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add education');
      }
    } catch (error) {
      console.error('Error adding education:', error);
      toast.error('Failed to add education');
    }
  };

  const handleAddTestScore = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/user/test-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType,
          testDate: testDate || null,
          overallScore: overallScore || null,
          readingScore: readingScore || null,
          writingScore: writingScore || null,
          listeningScore: listeningScore || null,
          speakingScore: speakingScore || null,
        }),
      });

      if (response.ok) {
        toast.success('Test score added successfully!');
        setShowTestScoreForm(false);
        resetTestScoreForm();
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add test score');
      }
    } catch (error) {
      console.error('Error adding test score:', error);
      toast.error('Failed to add test score');
    }
  };

  const resetEducationForm = () => {
    setInstitutionName('');
    setInstitutionCountry('');
    setEducationLevel('');
    setEducationFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setGrade('');
    setGradingSystem('');
    setGraduated(false);
  };

  const resetTestScoreForm = () => {
    setTestType('');
    setTestDate('');
    setOverallScore('');
    setReadingScore('');
    setWritingScore('');
    setListeningScore('');
    setSpeakingScore('');
  };

  const formatEducationLevel = (level: string) => {
    return EDUCATION_LEVELS.find(l => l.value === level)?.label || level;
  };

  if (loading) {
    return <PageLoader text="Loading academic profile..." />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Academic Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your education and test scores</p>
        </div>
      </div>

      {/* Basic Profile Information */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Profile Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Education Level
            </label>
            <select
              value={currentEducationLevel}
              onChange={(e) => setCurrentEducationLevel(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              placeholder="e.g., Computer Science, Business Administration"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-3">
              Preferred Study Countries (Select multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-background border border-border rounded-lg">
              {COUNTRIES.map((country) => (
                <label key={country} className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={preferredCountries.includes(country)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPreferredCountries([...preferredCountries, country]);
                      } else {
                        setPreferredCountries(preferredCountries.filter(c => c !== country));
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{country}</span>
                </label>
              ))}
            </div>
            
            {/* Other Country Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Other Country (if not listed above)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherCountry}
                  onChange={(e) => setOtherCountry(e.target.value)}
                  placeholder="Enter country name"
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

            {/* Selected Countries Display */}
            {preferredCountries.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">Selected Countries:</p>
                <div className="flex flex-wrap gap-2">
                  {preferredCountries.map((country) => (
                    <span
                      key={country}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {country}
                      <button
                        type="button"
                        onClick={() => setPreferredCountries(preferredCountries.filter(c => c !== country))}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Education History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Education History
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {migrating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Migrate Documents
                </>
              )}
            </button>
            <button
              onClick={handleAutoFillFromDocuments}
              disabled={autoFilling}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {autoFilling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Auto-filling...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  Auto-fill from Documents
                </>
              )}
            </button>
            <button
              onClick={() => setShowEducationForm(!showEducationForm)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Education
            </button>
          </div>
        </div>

        {/* Education Form */}
        {showEducationForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddEducation}
            className="mb-6 p-4 bg-background border border-border rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Institution Name *</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g., University of Ghana"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                <select
                  value={institutionCountry}
                  onChange={(e) => setInstitutionCountry(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Education Level *</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Field of Study</label>
                <input
                  type="text"
                  value={educationFieldOfStudy}
                  onChange={(e) => setEducationFieldOfStudy(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isCurrent}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Grade/GPA</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g., 3.5, 75%, A"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Grading System</label>
                <select
                  value={gradingSystem}
                  onChange={(e) => setGradingSystem(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select system</option>
                  {GRADING_SYSTEMS.map((system) => (
                    <option key={system.value} value={system.value}>{system.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Currently studying</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={graduated}
                    onChange={(e) => setGraduated(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Graduated</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Education
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEducationForm(false);
                  resetEducationForm();
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Education List */}
        {profile?.educationHistory && profile.educationHistory.length > 0 ? (
          <div className="space-y-3">
            {profile.educationHistory.map((edu) => (
              <div key={edu.id} className="p-4 bg-background border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{edu.institutionName}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatEducationLevel(edu.educationLevel)}
                      {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                      {edu.institutionCountry && ` • ${edu.institutionCountry}`}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {edu.grade && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                          Grade: {edu.grade}
                        </span>
                      )}
                      {edu.graduated && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                          Graduated
                        </span>
                      )}
                      {edu.isCurrent && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No education history added yet. Add your schools to get started.
          </p>
        )}
      </div>

      {/* Test Scores */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Test Scores
          </h3>
          <button
            onClick={() => setShowTestScoreForm(!showTestScoreForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Test Score
          </button>
        </div>

        {/* Test Score Form */}
        {showTestScoreForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddTestScore}
            className="mb-6 p-4 bg-background border border-border rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Test Type *</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select test</option>
                  {TEST_TYPES.map((test) => (
                    <option key={test.value} value={test.value}>{test.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Test Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Overall Score</label>
                <input
                  type="text"
                  value={overallScore}
                  onChange={(e) => setOverallScore(e.target.value)}
                  placeholder="e.g., 7.5, 100"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {(testType === 'IELTS' || testType === 'TOEFL' || testType === 'PTE' || testType === 'DUOLINGO') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Reading</label>
                    <input
                      type="text"
                      value={readingScore}
                      onChange={(e) => setReadingScore(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Writing</label>
                    <input
                      type="text"
                      value={writingScore}
                      onChange={(e) => setWritingScore(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Listening</label>
                    <input
                      type="text"
                      value={listeningScore}
                      onChange={(e) => setListeningScore(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Speaking</label>
                    <input
                      type="text"
                      value={speakingScore}
                      onChange={(e) => setSpeakingScore(e.target.value)}
                      className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add Test Score
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTestScoreForm(false);
                  resetTestScoreForm();
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Test Scores List */}
        {profile?.testScores && profile.testScores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.testScores.map((score) => (
              <div key={score.id} className="p-4 bg-background border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{score.testType}</h4>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {score.overallScore}
                  </span>
                </div>
                {(score.readingScore || score.writingScore || score.listeningScore || score.speakingScore) && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                    {score.readingScore && <div>Reading: {score.readingScore}</div>}
                    {score.writingScore && <div>Writing: {score.writingScore}</div>}
                    {score.listeningScore && <div>Listening: {score.listeningScore}</div>}
                    {score.speakingScore && <div>Speaking: {score.speakingScore}</div>}
                  </div>
                )}
                {score.testDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Date: {new Date(score.testDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No test scores added yet. Add your TOEFL, IELTS, or other test scores.
          </p>
        )}
      </div>
    </div>
  );
}
