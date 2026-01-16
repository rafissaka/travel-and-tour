'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Upload, X, Check, Loader2, Trash2, Eye, Plus, Calendar } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from 'sonner';
import RequirementsSection from './requirements-section';
import PageLoader from '@/app/components/PageLoader';

interface Service {
  id: string;
  title: string;
  slug: string;
}

interface Program {
  id: string;
  serviceId: string;
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
  features: string[] | null;
  requirements: string[] | null;
  benefits: string[] | null;
  tuitionFee: string | null;
  applicationFee: string | null;
  scholarshipType: string | null;
  isActive: boolean;
  displayOrder: number;
  availableSlots: number | null;
  service: Service;
  createdAt: string;
}

export default function ProgramsAdminPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; programId: string | null }>({
    open: false,
    programId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [programsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    serviceId: '',
    title: '',
    slug: '',
    tagline: '',
    description: '',
    country: '',
    university: '',
    duration: '',
    startDate: '',
    endDate: '',
    deadline: '',
    features: [''],
    requirements: [''],
    benefits: [''],
    tuitionFee: '',
    applicationFee: '',
    scholarshipType: '',
    isActive: true,
    displayOrder: 0,
    availableSlots: undefined as number | undefined,
  });

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
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-primary text-white'
              : 'bg-background hover:bg-muted text-foreground'
          }`}
          type="button"
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-primary text-white'
              : 'bg-background hover:bg-muted text-foreground'
          }`}
          type="button"
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white'
              : 'bg-background hover:bg-muted text-foreground'
          }`}
          type="button"
        >
          Bullets
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
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

  // Fetch services and programs
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services?active=true');
      if (response.ok) {
        const data = await response.json();
        // Filter to only show "Study & Summer Programs Abroad" service
        const studyProgramsService = data.find((s: any) =>
          s.slug === 'study-programs' ||
          s.title.toLowerCase().includes('study') && s.title.toLowerCase().includes('program')
        );
        setServices(studyProgramsService ? [studyProgramsService] : data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchPrograms();
  }, [fetchServices, fetchPrograms]);

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

  // Handle array fields
  const addArrayItem = (field: 'features' | 'requirements' | 'benefits') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const updateArrayItem = (field: 'features' | 'requirements' | 'benefits', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayItem = (field: 'features' | 'requirements' | 'benefits', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  // Create program
  const handleCreate = async () => {
    if (!formData.serviceId) {
      toast.error('Please select a service');
      return;
    }

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

        const uploadRes = await fetch('/api/services/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const fullDescription = editor?.getHTML() || '';
      const filteredFeatures = formData.features.filter(f => f.trim() !== '');
      const filteredRequirements = formData.requirements.filter(r => r.trim() !== '');
      const filteredBenefits = formData.benefits.filter(b => b.trim() !== '');

      // Create program
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          title: formData.title,
          slug: formData.slug,
          tagline: formData.tagline || null,
          description: formData.description || null,
          fullDescription: fullDescription || null,
          country: formData.country || null,
          university: formData.university || null,
          duration: formData.duration || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          deadline: formData.deadline || null,
          imageUrl,
          features: filteredFeatures.length > 0 ? filteredFeatures : null,
          requirements: filteredRequirements.length > 0 ? filteredRequirements : null,
          benefits: filteredBenefits.length > 0 ? filteredBenefits : null,
          tuitionFee: formData.tuitionFee || null,
          applicationFee: formData.applicationFee || null,
          scholarshipType: formData.scholarshipType || null,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder || 0,
          availableSlots: formData.availableSlots,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create program');
      }

      toast.success('Program created successfully');

      // Reset form
      setFormData({
        serviceId: '',
        title: '',
        slug: '',
        tagline: '',
        description: '',
        country: '',
        university: '',
        duration: '',
        startDate: '',
        endDate: '',
        deadline: '',
        features: [''],
        requirements: [''],
        benefits: [''],
        tuitionFee: '',
        applicationFee: '',
        scholarshipType: '',
        isActive: true,
        displayOrder: 0,
        availableSlots: undefined,
      });
      editor?.commands.setContent('');
      removePreview();

      // Refresh programs
      fetchPrograms();
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create program');
    } finally {
      setUploading(false);
    }
  };

  // Delete program
  const handleDelete = async () => {
    if (!deleteDialog.programId) return;

    try {
      const response = await fetch(`/api/programs?id=${deleteDialog.programId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Program deleted successfully');
        fetchPrograms();
        setDeleteDialog({ open: false, programId: null });
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete program');
    }
  };

  // Toggle active status
  const toggleActive = async (program: Program) => {
    try {
      const response = await fetch('/api/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: program.id,
          isActive: !program.isActive,
        }),
      });

      if (response.ok) {
        toast.success(program.isActive ? 'Program deactivated' : 'Program activated');
        fetchPrograms();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update program');
    }
  };

  // Group programs by service
  const programsByService = programs.reduce((acc, program) => {
    const serviceName = program.service.title;
    if (!acc[serviceName]) {
      acc[serviceName] = [];
    }
    acc[serviceName].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  // Pagination logic
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = programs.slice(indexOfFirstProgram, indexOfLastProgram);
  const totalPages = Math.ceil(programs.length / programsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <PageLoader text="Loading programs..." />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Programs Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage programs under services</p>
        </div>
      </div>

      {/* Create Section */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Create New Program</h2>

        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Parent Service *
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Drag and drop program image here, or click to select
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
              Program Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
              }}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Stipendium Hungaricum Scholarship"
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
              placeholder="program-slug"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Short catchy tagline"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Short Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brief description of the program"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Hungary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              University/Institution
            </label>
            <input
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Various Hungarian Universities"
            />
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
              placeholder="e.g., 3-5 years"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Scholarship Type
            </label>
            <input
              type="text"
              value={formData.scholarshipType}
              onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Full Scholarship"
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
              Application Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tuition Fee
            </label>
            <input
              type="text"
              value={formData.tuitionFee}
              onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., ₵0 (Fully funded)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Application Fee
            </label>
            <input
              type="text"
              value={formData.applicationFee}
              onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., ₵500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Available Slots
            </label>
            <input
              type="number"
              value={formData.availableSlots || ''}
              onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Key Features
          </label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateArrayItem('features', index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Feature ${index + 1}`}
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="w-full px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            >
              + Add Feature
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Requirements
          </label>
          <div className="space-y-2">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Requirement ${index + 1}`}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="w-full px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            >
              + Add Requirement
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Benefits
          </label>
          <div className="space-y-2">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Benefit ${index + 1}`}
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('benefits', index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('benefits')}
              className="w-full px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            >
              + Add Benefit
            </button>
          </div>
        </div>

        {/* Rich Text Editor for Full Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Description
          </label>
          <div className="border border-border rounded-lg bg-background overflow-hidden">
            <MenuBar />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="active" className="text-sm text-foreground cursor-pointer">
            Active (visible to users)
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
              Create Program
            </>
          )}
        </button>
      </div>

      {/* Programs List Grouped by Service */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Programs</h2>
          {programs.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {programs.length} program{programs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {programs.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No programs created yet</p>
            <p className="text-sm text-muted-foreground">Create your first program above</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(programsByService).map(([serviceName, servicePrograms]) => (
              <div key={serviceName}>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {serviceName}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({servicePrograms.length} program{servicePrograms.length !== 1 ? 's' : ''})
                  </span>
                </h3>

                <div className="space-y-4">
                  {servicePrograms.map((program) => (
                    <div
                      key={program.id}
                      className="flex flex-col md:flex-row gap-4 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      {/* Image */}
                      {program.imageUrl && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0">
                          <img
                            src={program.imageUrl}
                            alt={program.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-lg font-bold text-foreground">{program.title}</h4>
                            {program.tagline && (
                              <p className="text-sm text-muted-foreground">{program.tagline}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {program.isActive ? (
                              <span className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {program.country && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              {program.country}
                            </span>
                          )}
                          {program.duration && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                              <Calendar className="w-3 h-3" />
                              {program.duration}
                            </span>
                          )}
                          {program.scholarshipType && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                              {program.scholarshipType}
                            </span>
                          )}
                        </div>

                        {program.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {program.description}
                          </p>
                        )}

                        {(program.tuitionFee || program.applicationFee) && (
                          <div className="flex flex-wrap gap-4 text-sm">
                            {program.tuitionFee && (
                              <p className="text-foreground">
                                <span className="text-muted-foreground">Tuition:</span>{' '}
                                <span className="font-semibold">{program.tuitionFee}</span>
                              </p>
                            )}
                            {program.applicationFee && (
                              <p className="text-foreground">
                                <span className="text-muted-foreground">Application:</span>{' '}
                                <span className="font-semibold">{program.applicationFee}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {program.availableSlots && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{program.availableSlots}</span> slots available
                          </p>
                        )}

                        {/* Requirements Section */}
                        <RequirementsSection programId={program.id} programTitle={program.title} />
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2">
                        <button
                          onClick={() => toggleActive(program)}
                          className="p-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                          title={program.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Eye className={`w-5 h-5 ${program.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, programId: program.id })}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete program"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                <h3 className="text-lg font-semibold text-foreground">Delete Program</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Are you sure you want to delete this program? This will permanently remove it from the database.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialog({ open: false, programId: null })}
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
    </div>
  );
}
