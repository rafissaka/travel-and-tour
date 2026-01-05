'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, CheckCircle, XCircle, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  userId: string | null;
}

export default function MyTestimonialsPage() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
  });

  useEffect(() => {
    checkUserAndFetchTestimonials();
  }, []);

  const checkUserAndFetchTestimonials = async () => {
    try {
      // Check if user is admin
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const isAdmin = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
        
        // Redirect admins to admin testimonials page
        if (isAdmin) {
          router.push('/admin/testimonials');
          return;
        }
        
        setCurrentUserId(data.user.id);
      }
      
      fetchMyTestimonials();
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const fetchMyTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?admin=true');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only current user's testimonials
        const myTestimonials = currentUserId 
          ? data.filter((t: Testimonial) => t.userId === currentUserId)
          : data;
        setTestimonials(myTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error('Please write your testimonial');
      return;
    }

    if (formData.content.length > 1000) {
      toast.error('Testimonial must be less than 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing testimonial
        const response = await fetch('/api/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        });

        if (response.ok) {
          toast.success('Testimonial updated! Pending approval.');
          resetForm();
          fetchMyTestimonials();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to update testimonial');
        }
      } else {
        // Create new testimonial
        const response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Testimonial submitted! Pending approval.');
          resetForm();
          fetchMyTestimonials();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to submit testimonial');
        }
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error('Failed to submit testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      title: testimonial.title || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
    });
    setShowForm(true);
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
        fetchMyTestimonials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', rating: 5 });
    setEditingId(null);
    setShowForm(false);
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
        Pending Approval
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share your experience and help others discover our services
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Send className="w-5 h-5" />
          Write Testimonial
        </button>
      </div>

      {/* New/Edit Testimonial Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-2xl border-2 border-border p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingId ? 'Edit Testimonial' : 'Write a Testimonial'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Title/Role (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Student, Business Owner, Traveler"
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Your Testimonial <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Share your experience with our services..."
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.content.length}/1000 characters
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Your testimonial will be reviewed by our team before being published on the website.
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-background border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.content.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {editingId ? 'Update Testimonial' : 'Submit Testimonial'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-card rounded-2xl border-2 border-border p-12 text-center">
          <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No testimonials yet</h3>
          <p className="text-muted-foreground mb-6">
            Share your experience with our services to help others
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Write Your First Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border-2 border-border p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.avatarUrl ? (
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                    {testimonial.title && (
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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

              <p className="text-foreground leading-relaxed mb-4">{testimonial.content}</p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Submitted on {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  {!testimonial.isApproved && (
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="px-4 py-2 bg-background border-2 border-border text-foreground rounded-lg font-medium hover:bg-muted transition-all flex items-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
