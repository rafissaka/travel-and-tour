'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Loader2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import PageLoader from '@/app/components/PageLoader';

interface UserDocument {
  id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  issueDate: string | null;
  expiryDate: string | null;
  issuingAuthority: string | null;
  documentNumber: string | null;
  // Institutional Information
  institutionName: string | null;
  courseOfStudy: string | null;
  startDate: string | null;
  endDate: string | null;
  completionDate: string | null;
  fundingType: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  academicProfile: {
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phone: string | null;
    };
  };
}

interface DocumentStats {
  total: number;
  verified: number;
  pending: number;
  byType: Record<string, number>;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [filterVerified]);

  const fetchDocuments = async () => {
    try {
      let url = '/api/admin/documents';
      const params = new URLSearchParams();
      
      if (filterVerified === 'verified') params.append('verified', 'true');
      if (filterVerified === 'pending') params.append('verified', 'false');
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        setStats(data.stats);
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

  const handleVerify = async (documentId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/documents?id=${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verified }),
      });

      if (response.ok) {
        toast.success(verified ? 'Document verified' : 'Verification removed');
        fetchDocuments();
        setSelectedDocument(null);
      } else {
        toast.error('Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredDocuments = documents.filter((doc) => {
    const userName = `${doc.academicProfile.user.firstName || ''} ${doc.academicProfile.user.lastName || ''}`.toLowerCase();
    const email = doc.academicProfile.user.email.toLowerCase();
    const docName = doc.documentName.toLowerCase();
    const search = searchQuery.toLowerCase();

    return userName.includes(search) || email.includes(search) || docName.includes(search);
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Document Verification</h1>
          <p className="text-sm text-muted-foreground">Review and verify user documents for eligibility</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Documents</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <p className="text-sm text-green-700 dark:text-green-400 mb-2">Verified</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.verified}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, email, or document..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Documents</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <PageLoader text="Loading documents..." />
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Documents Found</h3>
          <p className="text-muted-foreground">No documents match your current filters</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{doc.documentName}</h3>
                        <p className="text-sm text-muted-foreground">{formatDocumentType(doc.documentType)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.isVerified ? (
                          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-full">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-full">
                            <XCircle className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="p-3 bg-card border border-border rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Student: {doc.academicProfile.user.firstName} {doc.academicProfile.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.academicProfile.user.email} | {doc.academicProfile.user.phone || 'No phone'}
                      </p>
                    </div>

                    {/* Institutional Information */}
                    {(doc.institutionName || doc.courseOfStudy || doc.startDate || doc.fundingType) && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Institutional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {doc.institutionName && (
                            <div>
                              <span className="text-muted-foreground">Institution:</span>{' '}
                              <span className="font-medium text-foreground">{doc.institutionName}</span>
                            </div>
                          )}
                          {doc.courseOfStudy && (
                            <div>
                              <span className="text-muted-foreground">Course:</span>{' '}
                              <span className="font-medium text-foreground">{doc.courseOfStudy}</span>
                            </div>
                          )}
                          {doc.startDate && (
                            <div>
                              <span className="text-muted-foreground">Start:</span>{' '}
                              <span className="font-medium text-foreground">{formatDate(doc.startDate)}</span>
                            </div>
                          )}
                          {doc.endDate && (
                            <div>
                              <span className="text-muted-foreground">End:</span>{' '}
                              <span className="font-medium text-foreground">{formatDate(doc.endDate)}</span>
                            </div>
                          )}
                          {doc.completionDate && (
                            <div>
                              <span className="text-muted-foreground">Completed:</span>{' '}
                              <span className="font-medium text-foreground">{formatDate(doc.completionDate)}</span>
                            </div>
                          )}
                          {doc.fundingType && (
                            <div>
                              <span className="text-muted-foreground">Funding:</span>{' '}
                              <span className="font-medium text-foreground">
                                {doc.fundingType.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {doc.issuingAuthority && (
                        <div>
                          <span className="text-muted-foreground">Issued by:</span>{' '}
                          <span className="font-medium text-foreground">{doc.issuingAuthority}</span>
                        </div>
                      )}
                      {doc.documentNumber && (
                        <div>
                          <span className="text-muted-foreground">Doc #:</span>{' '}
                          <span className="font-medium text-foreground">{doc.documentNumber}</span>
                        </div>
                      )}
                      {doc.issueDate && (
                        <div>
                          <span className="text-muted-foreground">Issued:</span>{' '}
                          <span className="font-medium text-foreground">{formatDate(doc.issueDate)}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Uploaded:</span>{' '}
                        <span className="font-medium text-foreground">{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      title="View document"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    {!doc.isVerified ? (
                      <button
                        onClick={() => handleVerify(doc.id, true)}
                        className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                        title="Verify document"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(doc.id, false)}
                        className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        title="Remove verification"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
