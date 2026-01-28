'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, MapPin, Calendar, DollarSign, Clock,
  Globe, BookOpen, Award, FileText, CheckCircle, XCircle,
  ArrowLeft, Loader2, School
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Program {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  fullDescription: string | null;
  country: string | null;
  university: string | null;
  duration: string | null;
  startDate: string | null;
  endDate: string | null;
  deadline: string | null;
  imageUrl: string | null;
  features: any;
  requirements: any;
  benefits: any;
  tuitionFee: string | null;
  applicationFee: string | null;
  scholarshipType: string | null;
  isActive: boolean;
}

interface ProgramRequirement {
  acceptedEducationLevels: string[];
  minimumGpa: number | null;
  gradingSystem: string | null;
  requiredDocuments: string[];
  toeflMinimum: number | null;
  ieltsMinimum: number | null;
  duolingoMinimum: number | null;
  workExperienceRequired: boolean;
  minimumWorkExperienceYears: number | null;
  additionalRequirements: string | null;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [requirements, setRequirements] = useState<ProgramRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProgram();
  }, [programId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchProgram = async () => {
    try {
      const [programRes, requirementsRes] = await Promise.all([
        fetch(`/api/programs/${programId}`),
        fetch(`/api/programs/${programId}/requirements`)
      ]);

      if (programRes.ok) {
        const programData = await programRes.json();
        setProgram(programData);
      } else {
        toast.error('Program not found');
      }

      if (requirementsRes.ok) {
        const reqData = await requirementsRes.json();
        // API returns array, get first item
        setRequirements(Array.isArray(reqData) && reqData.length > 0 ? reqData[0] : null);
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const formatEducationLevel = (level: string) => {
    return level.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Program Not Found</h1>
          <p className="text-muted-foreground mb-6">The program you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{program.title}</h1>
              {program.tagline && (
                <p className="text-lg text-white/90 mb-2">{program.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                {program.university && (
                  <div className="flex items-center gap-2">
                    <School className="w-5 h-5" />
                    <span>{program.university}</span>
                  </div>
                )}
                {program.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{program.country}</span>
                  </div>
                )}
                {program.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{program.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Program Details</h2>

              {program.description && (
                <div className="text-muted-foreground mb-4 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program.description }} />
              )}

              {program.fullDescription && (
                <div className="text-muted-foreground mb-6 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program.fullDescription }} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {program.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{program.duration}</p>
                    </div>
                  </div>
                )}

                {program.tuitionFee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tuition Fee</p>
                      <p className="font-medium text-foreground">{program.tuitionFee}</p>
                    </div>
                  </div>
                )}

                {program.applicationFee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Application Fee</p>
                      <p className="font-medium text-foreground">{program.applicationFee}</p>
                    </div>
                  </div>
                )}

                {program.deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Application Deadline</p>
                      <p className="font-medium text-foreground">
                        {new Date(program.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {program.startDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(program.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {program.endDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(program.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              {program.features && Array.isArray(program.features) && program.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Features</h3>
                  <ul className="space-y-2">
                    {program.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {program.benefits && Array.isArray(program.benefits) && program.benefits.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {program.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {program.scholarshipType && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Scholarship: {program.scholarshipType}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Requirements */}
            {requirements && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Admission Requirements</h2>

                <div className="space-y-6">
                  {/* Education Level */}
                  {requirements.acceptedEducationLevels && requirements.acceptedEducationLevels.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Education Level</h3>
                      <div className="flex flex-wrap gap-2">
                        {requirements.acceptedEducationLevels.map((level) => (
                          <span
                            key={level}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {formatEducationLevel(level)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GPA */}
                  {requirements.minimumGpa && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Minimum GPA</h3>
                      <p className="text-muted-foreground">
                        {requirements.minimumGpa} {requirements.gradingSystem ? `(${requirements.gradingSystem})` : ''}
                      </p>
                    </div>
                  )}

                  {/* Test Scores */}
                  {(requirements.toeflMinimum || requirements.ieltsMinimum || requirements.duolingoMinimum) && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">English Language Requirements</h3>
                      <ul className="space-y-1 text-muted-foreground">
                        {requirements.toeflMinimum && <li>• TOEFL: Minimum {requirements.toeflMinimum}</li>}
                        {requirements.ieltsMinimum && <li>• IELTS: Minimum {requirements.ieltsMinimum}</li>}
                        {requirements.duolingoMinimum && <li>• Duolingo: Minimum {requirements.duolingoMinimum}</li>}
                      </ul>
                    </div>
                  )}

                  {/* Work Experience */}
                  {requirements.workExperienceRequired && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Work Experience</h3>
                      <p className="text-muted-foreground">
                        {requirements.minimumWorkExperienceYears
                          ? `Minimum ${requirements.minimumWorkExperienceYears} years required`
                          : 'Work experience required'}
                      </p>
                    </div>
                  )}

                  {/* Required Documents */}
                  {requirements.requiredDocuments && requirements.requiredDocuments.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Required Documents</h3>
                      <ul className="space-y-1">
                        {requirements.requiredDocuments.map((doc) => (
                          <li key={doc} className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4 text-primary" />
                            {formatDocumentType(doc)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Requirements */}
                  {requirements.additionalRequirements && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Additional Requirements</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {requirements.additionalRequirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            {isAuthenticated ? (
              <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Ready to Apply?</h3>
                <p className="text-muted-foreground mb-6">
                  Check your eligibility and start your application process.
                </p>
                <Link
                  href="/profile/applications"
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  View My Eligibility
                </Link>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Interested in this program?</h3>
                <p className="text-muted-foreground mb-6">
                  Create an account to check your eligibility and apply.
                </p>
                <Link
                  href="/auth/signup"
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full px-6 py-3 bg-background border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  Log In
                </Link>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Quick Information</h3>
              <div className="space-y-3 text-sm">
                {program.country && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country</span>
                    <span className="font-medium text-foreground">{program.country}</span>
                  </div>
                )}
                {program.university && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">University</span>
                    <span className="font-medium text-foreground">{program.university}</span>
                  </div>
                )}
                {program.duration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{program.duration}</span>
                  </div>
                )}
                {program.scholarshipType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground">{program.scholarshipType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
