'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Upload, GraduationCap, CheckCircle, AlertCircle,
  Loader2, Award, BookOpen, TrendingUp, FileCheck, Plus, XCircle,
  Search, Filter, ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface AcademicProfile {
  id: string;
  currentEducationLevel: string | null;
  highestEducationLevel: string | null;
  intendedStudyLevel: string | null;
  fieldOfStudy: string | null;
  userEducationHistory: any[];
  userDocuments: any[];
  userTestScores: any[];
}

interface EligibleProgram {
  id: string;
  eligibilityScore: number;
  isEligible: boolean;
  metRequirements: string[];
  missingRequirements: string[];
  recommendationNotes: string;
  program: {
    id: string;
    title: string;
    country: string;
    university: string;
    imageUrl?: string;
    scholarshipType?: string;
  };
}

interface EligibilityData {
  eligibility: EligibleProgram[];
  profile: AcademicProfile | null;
  summary: {
    total: number;
    eligible: number;
    highMatch: number;
    mediumMatch: number;
    lowMatch: number;
  };
}

export default function ApplicationsPage() {
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileChecklist, setProfileChecklist] = useState<{
    item: string;
    completed: boolean;
    link?: string;
  }[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [existingApplications, setExistingApplications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 6;

  useEffect(() => {
    fetchEligibilityData();
    fetchExistingApplications();
  }, []);

  const fetchEligibilityData = async () => {
    try {
      const response = await fetch('/api/user/eligible-programs?recalculate=true');
      if (response.ok) {
        const data = await response.json();
        setEligibilityData(data);
        await calculateProfileCompletion(data.profile);
      } else {
        toast.error('Failed to load eligibility data');
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
      toast.error('Failed to load eligibility data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = async (profile: AcademicProfile | null) => {
    let completed = 0;
    let total = 7; // Total checklist items
    const checklist: { item: string; completed: boolean; link?: string }[] = [];

    try {
      // Fetch user basic info
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();

        // Check basic info (name, phone)
        const hasName = !!(userData.user?.firstName && userData.user?.lastName);
        const hasPhone = !!userData.user?.phone;

        checklist.push({
          item: 'First & Last Name',
          completed: hasName,
          link: '/profile/complete-profile',
        });
        checklist.push({
          item: 'Phone Number',
          completed: hasPhone,
          link: '/profile/complete-profile',
        });

        if (hasName) completed++;
        if (hasPhone) completed++;
      }

      // Fetch user profile (nationality, passport, etc.)
      const profileResponse = await fetch('/api/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();

        const hasDOB = !!profileData.dateOfBirth;
        const hasNationality = !!profileData.nationality;
        const hasEmergencyContact = !!(profileData.emergencyContact && profileData.emergencyPhone);

        checklist.push({
          item: 'Date of Birth',
          completed: hasDOB,
          link: '/profile/complete-profile',
        });
        checklist.push({
          item: 'Nationality',
          completed: hasNationality,
          link: '/profile/complete-profile',
        });
        checklist.push({
          item: 'Emergency Contact',
          completed: hasEmergencyContact,
          link: '/profile/complete-profile',
        });

        if (hasDOB) completed++;
        if (hasNationality) completed++;
        if (hasEmergencyContact) completed++;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Check academic profile
    if (profile) {
      const hasEducationLevel = !!(profile.currentEducationLevel || profile.highestEducationLevel);
      const hasDocuments = !!(profile.userDocuments && profile.userDocuments.length > 0);

      checklist.push({
        item: 'Education Level',
        completed: hasEducationLevel,
        link: '/profile/academic-profile',
      });
      checklist.push({
        item: 'At least 1 Document Uploaded',
        completed: hasDocuments,
        link: '/profile/documents',
      });

      if (hasEducationLevel) completed++;
      if (hasDocuments) completed++;
    } else {
      checklist.push({
        item: 'Education Level',
        completed: false,
        link: '/profile/academic-profile',
      });
      checklist.push({
        item: 'At least 1 Document Uploaded',
        completed: false,
        link: '/profile/documents',
      });
    }

    setProfileCompletion(Math.round((completed / total) * 100));
    setProfileChecklist(checklist);
  };

  const fetchExistingApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const applications = await response.json();
        // Store programIds of existing applications
        const programIds = new Set<string>(
          applications
            .filter((app: any) => app.programId)
            .map((app: any) => app.programId as string)
        );
        setExistingApplications(programIds);
      }
    } catch (error) {
      console.error('Error fetching existing applications:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const toggleExpanded = (programId: string) => {
    setExpandedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  // Get unique countries from programs
  const countries = eligibilityData
    ? Array.from(new Set(eligibilityData.eligibility.map(item => item.program.country)))
    : [];

  // Filter and search programs
  const filteredPrograms = eligibilityData?.eligibility.filter(item => {
    const matchesSearch =
      item.program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.program.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.program.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = countryFilter === 'all' || item.program.country === countryFilter;

    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && item.eligibilityScore >= 80) ||
      (scoreFilter === 'medium' && item.eligibilityScore >= 60 && item.eligibilityScore < 80) ||
      (scoreFilter === 'low' && item.eligibilityScore < 60);

    return matchesSearch && matchesCountry && matchesScore;
  }).sort((a, b) => b.eligibilityScore - a.eligibilityScore) || [];

  // Pagination
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);
  const startIndex = (currentPage - 1) * programsPerPage;
  const endIndex = startIndex + programsPerPage;
  const currentPrograms = filteredPrograms.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, countryFilter, scoreFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Program Discovery</h1>
          <p className="text-sm text-muted-foreground">Find programs you qualify for</p>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading applications..." />
      ) : (
        <>
          {/* Profile Completion Card */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Profile Completion
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your profile to unlock more program matches
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompletion}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <p className="text-sm font-medium text-foreground mt-2">{profileCompletion}% Complete</p>
              </div>

              {/* Profile Checklist */}
              {profileCompletion < 100 && (
                <div className="flex-1 mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">What's Missing?</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profileChecklist.map((item, index) => (
                      <Link
                        key={index}
                        href={item.link || '#'}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${item.completed
                          ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400'
                          : 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                          }`}
                      >
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{item.item}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full md:w-auto mt-4">
                <Link href="/profile/documents" className="w-full">
                  <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Documents
                  </button>
                </Link>
                <Link href="/profile/complete-profile" className="w-full">
                  <button className="w-full px-6 py-3 bg-white dark:bg-gray-800 text-foreground border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Complete Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {eligibilityData && eligibilityData.summary.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-muted-foreground">Total Programs</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{eligibilityData.summary.total}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Eligible</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{eligibilityData.summary.eligible}</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">High Match</span>
                </div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{eligibilityData.summary.highMatch}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-muted-foreground">Documents</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{eligibilityData.profile?.userDocuments.length || 0}</p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {eligibilityData && eligibilityData.eligibility.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search programs, universities, or countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                </div>

                {/* Country Filter */}
                <div className="w-full lg:w-64">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none text-sm"
                    >
                      <option value="all">All Countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Score Filter */}
                <div className="w-full lg:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      value={scoreFilter}
                      onChange={(e) => setScoreFilter(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none text-sm"
                    >
                      <option value="all">All Matches</option>
                      <option value="high">High Match (80%+)</option>
                      <option value="medium">Medium Match (60-79%)</option>
                      <option value="low">Low Match (&lt;60%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Counter */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{currentPrograms.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{filteredPrograms.length}</span> programs
                </p>
                {(searchQuery || countryFilter !== 'all' || scoreFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCountryFilter('all');
                      setScoreFilter('all');
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Eligible Programs Grid */}
          {eligibilityData && filteredPrograms.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Programs You Qualify For
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {currentPrograms.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col md:flex-row"
                  >
                    {/* Image Section */}
                    <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      <img
                        src={item.program.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"}
                        alt={item.program.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Match Score Overlay */}
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg p-2 shadow-sm text-center">
                        <p className={`text-xs font-bold ${getScoreColor(item.eligibilityScore)} uppercase tracking-wider`}>Match Score</p>
                        <p className={`text-xl font-black ${getScoreColor(item.eligibilityScore)}`}>{item.eligibilityScore}%</p>
                      </div>

                      {/* Status Badge Overlay */}
                      {existingApplications.has(item.program.id) && (
                        <div className="absolute top-4 right-4 md:left-auto md:right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Applied
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {item.program.title}
                            </h3>
                            {item.program.scholarshipType && (
                              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-1 inline-flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                {item.program.scholarshipType || "Stipendium Hungaricum scholarship"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{item.program.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <span>200+ universities in the country</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-foreground">Met: <span className="text-green-600">{item.metRequirements.length}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-foreground">Missing: <span className="text-red-500">{item.missingRequirements.length}</span></span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 items-center pt-4 border-t border-border">
                        {/* Expand Logic */}
                        {(item.metRequirements.length > 0 || item.missingRequirements.length > 0) && (
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mr-auto"
                          >
                            {expandedPrograms.has(item.id) ? 'Hide Requirements' : 'View Requirements'}
                          </button>
                        )}

                        {/* Action Buttons */}
                        {!existingApplications.has(item.program.id) && item.isEligible && (
                          <Link href={`/profile/applications/new?programId=${item.program.id}`}>
                            <button className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
                              Apply Now
                            </button>
                          </Link>
                        )}
                        {!existingApplications.has(item.program.id) && !item.isEligible && (
                          <Link href="/profile/documents">
                            <button className="px-5 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors shadow-sm">
                              Upload Missing Docs
                            </button>
                          </Link>
                        )}
                        <Link href={`/programs/${item.program.id}`}>
                          <button className="px-5 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg font-medium hover:bg-muted transition-colors">
                            View Details
                          </button>
                        </Link>
                      </div>

                      {/* Expanded Requirements View */}
                      {expandedPrograms.has(item.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.metRequirements.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">
                                  ✓ Requirements Met
                                </p>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                  {item.metRequirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.missingRequirements.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase tracking-wide">
                                  ✗ Missing Requirements
                                </p>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                  {item.missingRequirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <XCircle className="w-3.5 h-3.5 text-red-600 mt-0.5" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNum
                                ? 'bg-primary text-white'
                                : 'bg-card border border-border hover:bg-muted'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : eligibilityData && eligibilityData.eligibility.length > 0 ? (
            /* No Results from Filters */
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Programs Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to see more results
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCountryFilter('all');
                  setScoreFilter('all');
                }}
                className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Empty State - No Profile */
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Complete Your Profile to Find Programs</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your academic documents and complete your profile to see which programs you qualify for
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/profile/documents">
                  <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Documents
                  </button>
                </Link>
                <Link href="/profile/complete-profile">
                  <button className="px-8 py-3 bg-white dark:bg-gray-800 text-foreground border border-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Complete Profile
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-foreground">How It Works</h3>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Upload your academic documents (transcripts, certificates, test scores)</li>
                <li>Complete your academic profile with education history</li>
                <li>We'll automatically match you with programs you qualify for</li>
                <li>Apply to eligible programs with one click - your data auto-fills!</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-bold text-foreground">Need Help?</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Our team is here to help you find the perfect program. Contact us if you have questions about:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Document requirements</li>
                <li>Program eligibility</li>
                <li>Application process</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
