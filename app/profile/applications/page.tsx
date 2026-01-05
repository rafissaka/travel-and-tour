'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Eye, Edit, Trash2, Loader2, Clock, CheckCircle, XCircle, FileX } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Application {
  id: string;
  programName: string;
  programCountry: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileX className="w-5 h-5 text-gray-500" />;
      case 'SUBMITTED':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'UNDER_REVIEW':
        return <Eye className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-sm text-muted-foreground">Study & Summer Programs Abroad</p>
          </div>
        </div>

        <Link href="/profile/applications/new">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Application
          </motion.button>
        </Link>
      </div>

      {/* Applications List */}
      <div className="bg-card rounded-xl p-6 border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your journey by creating your first application
            </p>
            <Link href="/profile/applications/new">
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Application
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background rounded-lg border border-border p-6 hover:border-primary/50 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {application.programName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.programCountry}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                      <span>
                        Created: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      {application.submittedAt && (
                        <span>
                          Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/profile/applications/${application.id}`}>
                      <button
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                    {application.status === 'DRAFT' && (
                      <Link href={`/profile/applications/${application.id}/edit`}>
                        <button
                          className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                          title="Edit application"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-foreground">Application Process</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete the application form with all required information. You can save as draft and continue later.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-lg font-bold text-foreground">Review Time</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Applications are typically reviewed within 5-7 business days. You'll be notified via email.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-bold text-foreground">Need Help?</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Contact our support team if you have any questions about your application.
          </p>
        </div>
      </div>
    </div>
  );
}
