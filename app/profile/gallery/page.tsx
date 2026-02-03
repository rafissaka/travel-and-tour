'use client';

import { useState, useEffect, useCallback } from 'react';
import { Image, Upload, X, Check, Loader2, Trash2, Star } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { toast } from 'sonner';
import { sanitizeHtml } from "@/lib/sanitize";

interface GalleryImage {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  category: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; imageId: string | null }>({
    open: false,
    imageId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    isFeatured: false,
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

  // Fetch gallery images
  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    // Create previews
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
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

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Remove preview
  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      const description = editor?.getHTML() || '';

      for (const file of selectedFiles) {
        // Upload to Cloudinary
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadRes = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadRes.json();

        // Save to database
        const saveRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description,
            imageUrl: url,
            category: formData.category || null,
            isFeatured: formData.isFeatured,
          }),
        });

        if (!saveRes.ok) {
          throw new Error('Failed to save image');
        }
      }

      toast.success(`${selectedFiles.length} image(s) uploaded successfully`);

      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      setFormData({ title: '', category: '', isFeatured: false });
      editor?.commands.setContent('');

      // Refresh gallery
      fetchImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setDeleteDialog({ open: true, imageId: id });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, imageId: null });
  };

  // Delete image
  const handleDelete = async () => {
    if (!deleteDialog.imageId) return;

    try {
      const response = await fetch(`/api/gallery?id=${deleteDialog.imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Image deleted successfully');
        fetchImages();
        closeDeleteDialog();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  // Toggle featured
  const toggleFeatured = async (image: GalleryImage) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: image.id,
          isFeatured: !image.isFeatured,
        }),
      });

      if (response.ok) {
        toast.success(image.isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchImages();
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      toast.error('Failed to update image');
    }
  };

  // Pagination logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Image className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-sm text-muted-foreground">Upload and manage gallery images</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Upload New Images</h2>

        {/* Drag & Drop Zone */}
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
            Drag and drop images here, or click to select
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports JPG, PNG, WebP
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Select Files
          </label>
        </div>

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Selected Images ({previews.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter image title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Tours, Events, Destinations"
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
          <p className="text-xs text-muted-foreground mt-1">
            Use rich text formatting to add description
          </p>
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

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Upload Images
            </>
          )}
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Gallery Images</h2>
          {images.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstImage + 1}-{Math.min(indexOfLastImage, images.length)} of {images.length}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No images uploaded yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentImages.map((image) => (
                <div key={image.id} className="group relative bg-background rounded-lg overflow-hidden border border-border">
                  <div className="aspect-square relative">
                    <img
                      src={image.imageUrl}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                    {image.isFeatured && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleFeatured(image)}
                        className="p-2 bg-white text-foreground rounded-lg hover:bg-gray-100 transition-colors"
                        title={image.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-5 h-5 ${image.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(image.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground truncate">
                      {image.title || 'Untitled'}
                    </h3>
                    {image.category && (
                      <p className="text-xs text-muted-foreground mt-1">{image.category}</p>
                    )}
                    {image.description && (
                      <div
                        className="text-sm text-muted-foreground mt-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(image.description) }}
                      />
                    )}
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
                    // Show first page, last page, current page, and pages around current
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
                <h3 className="text-lg font-semibold text-foreground">Delete Image</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Are you sure you want to delete this image? This will permanently remove it from the gallery.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteDialog}
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
