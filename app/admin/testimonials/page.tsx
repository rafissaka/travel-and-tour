'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Clock, Trash2, Eye, Loader2, Award, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '@/app/components/PageLoader';

interface Testimonial {
  id: string;
  name: string;
  title: string | null;
  content: string;
  rating: number | null;
  avatarUrl: string | null;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

type FilterType = 'all' | 'pending' | 'approved';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [filter, testimonials]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?admin=true');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      } else {
        toast.error('Failed to load testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = testimonials;
    if (filter === 'pending') {
      filtered = testimonials.filter((t) => !t.isApproved);
    } else if (filter === 'approved') {
      filtered = testimonials.filter((t) => t.isApproved);
    }
    setFilteredTestimonials(filtered);
  };

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved }),
      });

      if (response.ok) {
        toast.success(isApproved ? 'Testimonial approved!' : 'Testimonial unapproved');
        fetchTestimonials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch('/api/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isFeatured }),
      });

      if (response.ok) {
        toast.success(isFeatured ? 'Testimonial featured!' : 'Testimonial unfeatured');
        fetchTestimonials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
        setShowDetailsModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const getStatusBadge = (testimonial: Testimonial) => {
    if (testimonial.isFeatured) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-current" />
          Featured
        </span>
      );
    }
    if (testimonial.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter((t) => !t.isApproved).length,
    approved: testimonials.filter((t) => t.isApproved).length,
    featured: testimonials.filter((t) => t.isFeatured).length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Testimonials Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Approve, moderate, and showcase customer testimonials
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.featured}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border-2 border-border p-1 flex flex-col sm:flex-row gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
            filter === 'all'
              ? 'bg-primary text-white shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Filter className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">All ({stats.total})</span>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
            filter === 'pending'
              ? 'bg-primary text-white shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Pending ({stats.pending})</span>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
            filter === 'approved'
              ? 'bg-primary text-white shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Approved ({stats.approved})</span>
        </button>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <PageLoader text="Loading testimonials..." />
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
          <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No testimonials found</h3>
          <p className="text-muted-foreground">
            {filter === 'pending'
              ? 'No pending testimonials at the moment'
              : filter === 'approved'
              ? 'No approved testimonials yet'
              : 'No testimonials have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground truncate">{testimonial.name}</h3>
                    {testimonial.title && (
                      <p className="text-sm text-muted-foreground truncate">{testimonial.title}</p>
                    )}
                    {testimonial.user && (
                      <p className="text-xs text-muted-foreground truncate">{testimonial.user.email}</p>
                    )}
                  </div>
                </div>
                <div className="self-start flex-shrink-0">
                  {getStatusBadge(testimonial)}
                </div>
              </div>

              {testimonial.rating && (
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= testimonial.rating!
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}

              <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
                {testimonial.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground mb-4">
                <span>Submitted {new Date(testimonial.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedTestimonial(testimonial);
                    setShowDetailsModal(true);
                  }}
                  className="w-full px-4 py-2 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>View</span>
                </button>

                {!testimonial.isApproved ? (
                  <button
                    onClick={() => handleApprove(testimonial.id, true)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Approve</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(testimonial.id, false)}
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Unapprove</span>
                  </button>
                )}

                {!testimonial.isFeatured ? (
                  <button
                    onClick={() => handleFeature(testimonial.id, true)}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span>Feature</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFeature(testimonial.id, false)}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Award className="w-4 h-4 flex-shrink-0" />
                    <span>Unfeature</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTestimonial && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-card rounded-2xl border-2 border-border z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Testimonial Details</h2>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="flex items-center gap-3">
                  {selectedTestimonial.avatarUrl ? (
                    <img
                      src={selectedTestimonial.avatarUrl}
                      alt={selectedTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {selectedTestimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {selectedTestimonial.name}
                    </h3>
                    {selectedTestimonial.title && (
                      <p className="text-sm text-muted-foreground">{selectedTestimonial.title}</p>
                    )}
                    {selectedTestimonial.user && (
                      <p className="text-xs text-muted-foreground">
                        {selectedTestimonial.user.email}
                      </p>
                    )}
                  </div>
                </div>

                {selectedTestimonial.rating && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= selectedTestimonial.rating!
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Testimonial</p>
                  <p className="text-foreground leading-relaxed">{selectedTestimonial.content}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Status</p>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedTestimonial)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Submitted</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedTestimonial.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedTestimonial.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
