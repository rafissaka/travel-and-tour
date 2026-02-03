'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Upload, X, Check, Loader2, Trash2, Star, MapPin, Clock, Users, Map } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from 'sonner';
import { sanitizeHtml } from "@/lib/sanitize";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  status: string;
  category: string | null;
  price: number | null;
  maxParticipants: number | null;
  currentParticipants: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    location: '',
    locationLat: '',
    locationLng: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    status: 'UPCOMING',
    category: 'tour',
    price: '',
    maxParticipants: '',
    isFeatured: false,
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempLocationLat, setTempLocationLat] = useState('');
  const [tempLocationLng, setTempLocationLng] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4 text-foreground',
      },
    },
  });

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('bold')
            ? 'bg-primary text-white'
            : 'bg-background hover:bg-muted text-foreground'
            }`}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('italic')
            ? 'bg-primary text-white'
            : 'bg-background hover:bg-muted text-foreground'
            }`}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('bulletList')
            ? 'bg-primary text-white'
            : 'bg-background hover:bg-muted text-foreground'
            }`}
          type="button"
        >
          Bullets
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('orderedList')
            ? 'bg-primary text-white'
            : 'bg-background hover:bg-muted text-foreground'
            }`}
          type="button"
        >
          Numbers
        </button>
      </div>
    );
  };

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addFile(file);
    }
  };

  const addFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      addFile(file);
    }
  };

  // Remove preview
  const removePreview = () => {
    setSelectedFile(null);
    setPreview('');
  };

  // Create event
  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Please enter a slug');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = '';

      // Upload image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/events/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const description = editor?.getHTML() || '';

      // Create event
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description,
          imageUrl,
          location: formData.location || null,
          locationLat: formData.locationLat ? parseFloat(formData.locationLat) : null,
          locationLng: formData.locationLng ? parseFloat(formData.locationLng) : null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
          duration: formData.duration || null,
          status: formData.status,
          category: formData.category || null,
          price: formData.price ? parseFloat(formData.price) : null,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          isFeatured: formData.isFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      toast.success('Event created successfully');

      // Reset form
      setFormData({
        title: '',
        slug: '',
        location: '',
        locationLat: '',
        locationLng: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        duration: '',
        status: 'UPCOMING',
        category: 'tour',
        price: '',
        maxParticipants: '',
        isFeatured: false,
      });
      editor?.commands.setContent('');
      removePreview();

      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create event');
    } finally {
      setUploading(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!deleteDialog.eventId) return;

    try {
      const response = await fetch(`/api/events?id=${deleteDialog.eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
        setDeleteDialog({ open: false, eventId: null });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete event');
    }
  };

  // Toggle featured
  const toggleFeatured = async (event: Event) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          isFeatured: !event.isFeatured,
        }),
      });

      if (response.ok) {
        toast.success(event.isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchEvents();
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      toast.error('Failed to update event');
    }
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Events Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage events & tours</p>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Create New Event</h2>

        {/* Image Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
            }`}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Drag and drop event image here, or click to select
          </p>
          <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, WebP</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Select Image
          </label>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={removePreview}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
              }}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="event-slug"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Latitude (for map)
            </label>
            <input
              type="number"
              step="any"
              value={formData.locationLat || ''}
              onChange={(e) => setFormData({ ...formData, locationLat: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 5.6037"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Longitude (for map)
            </label>
            <input
              type="number"
              step="any"
              value={formData.locationLng || ''}
              onChange={(e) => setFormData({ ...formData, locationLng: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., -0.1870"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => {
                setTempLocationLat(formData.locationLat || '5.6037');
                setTempLocationLng(formData.locationLng || '-0.1870');
                setShowMapPicker(true);
              }}
              className="w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Map className="w-5 h-5" />
              Pick Location from Map
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 3 Days"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="ENDED">Ended</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="tour">Tour</option>
              <option value="education">Education</option>
              <option value="admission">Admission</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <div className="border border-border rounded-lg bg-background overflow-hidden">
            <MenuBar />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="featured" className="text-sm text-foreground cursor-pointer">
            Mark as featured
          </label>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={uploading}
          className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Create Event
            </>
          )}
        </button>
      </div>

      {/* Events List */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Events</h2>
          {events.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, events.length)} of {events.length}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events created yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row gap-4 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  {/* Image */}
                  {event.imageUrl && (
                    <div className="w-full md:w-32 h-32 flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                      {event.isFeatured && (
                        <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      {event.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.duration}
                        </div>
                      )}
                      {event.maxParticipants && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.currentParticipants}/{event.maxParticipants}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${event.status === 'UPCOMING' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                        event.status === 'ONGOING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                          event.status === 'ENDED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                        {event.status}
                      </span>
                      {event.category && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <div
                        className="text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => toggleFeatured(event)}
                      className="p-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                      title={event.isFeatured ? 'Remove from featured' : 'Add to featured'}
                    >
                      <Star className={`w-5 h-5 ${event.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, eventId: event.id })}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                            ? 'bg-primary text-white'
                            : 'border border-border text-foreground hover:bg-muted'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="w-10 h-10 flex items-center justify-center text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-border shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Event</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Are you sure you want to delete this event? This will permanently remove it from the database.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialog({ open: false, eventId: null })}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMapPicker(false);
            }
          }}
        >
          <div className="bg-card rounded-xl w-full max-w-4xl border border-border shadow-2xl my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Pick Location from Map</h3>
                <p className="text-sm text-muted-foreground mt-1">Click on the map to select coordinates</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Map Content */}
            <div className="p-6 space-y-4">
              {/* Current Coordinates Display */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Latitude</label>
                  <input
                    type="text"
                    value={tempLocationLat}
                    onChange={(e) => setTempLocationLat(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Longitude</label>
                  <input
                    type="text"
                    value={tempLocationLng}
                    onChange={(e) => setTempLocationLng(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground"
                  />
                </div>
              </div>

              {/* Interactive Map */}
              <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border">
                <iframe
                  key={`${tempLocationLat}-${tempLocationLng}`}
                  src={`https://www.google.com/maps?q=${tempLocationLat},${tempLocationLng}&z=12&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">How to get coordinates:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open Google Maps in a new tab</li>
                      <li>Right-click on your desired location</li>
                      <li>Click on the coordinates at the top to copy them</li>
                      <li>Paste the latitude and longitude in the fields above</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Quick Location Buttons */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Quick locations:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempLocationLat('5.6037');
                      setTempLocationLng('-0.1870');
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
                  >
                    Accra, Ghana
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempLocationLat('6.6885');
                      setTempLocationLng('-1.6244');
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
                  >
                    Kumasi, Ghana
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempLocationLat('5.1054');
                      setTempLocationLng('-1.2446');
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
                  >
                    Cape Coast, Ghana
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempLocationLat('9.4034');
                      setTempLocationLng('-0.8393');
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
                  >
                    Tamale, Ghana
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end p-6 border-t border-border bg-muted/30 sticky bottom-0">
              <button
                type="button"
                onClick={() => {
                  setShowMapPicker(false);
                  // Reset temp values to original if cancelled
                  setTempLocationLat(formData.locationLat || '');
                  setTempLocationLng(formData.locationLng || '');
                }}
                className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Save temp values to form data
                  setFormData({
                    ...formData,
                    locationLat: tempLocationLat,
                    locationLng: tempLocationLng,
                  });
                  setShowMapPicker(false);
                  toast.success('Location coordinates set!');
                }}
                className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
