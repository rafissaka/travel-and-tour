'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/clients';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string, fileSize: number) => void;
  accept?: string;
  maxSizeMB?: number;
  bucketName?: string;
  folder?: string;
  label?: string;
  required?: boolean;
  currentFileUrl?: string;
  currentFileName?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = '*/*',
  maxSizeMB = 10,
  bucketName = 'documents',
  folder = 'user-uploads',
  label = 'Upload File',
  required = false,
  currentFileUrl,
  currentFileName,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(
    currentFileUrl && currentFileName
      ? { name: currentFileName, url: currentFileUrl, size: 0 }
      : null
  );
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique file name
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error.message}`);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);
      setUploadedFile({
        name: file.name,
        url: publicUrl,
        size: file.size,
      });

      // Notify parent component
      onUploadComplete(publicUrl, file.name, file.size);
      
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete('', '', 0);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {!uploadedFile ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className={`
              flex flex-col items-center justify-center w-full h-32 
              border-2 border-dashed rounded-lg cursor-pointer
              transition-all duration-200
              ${uploading 
                ? 'border-primary bg-primary/5 cursor-not-allowed' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-accent/5'
              }
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-primary font-medium">
                  Uploading... {progress}%
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-foreground font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Max file size: {maxSizeMB}MB
                </p>
              </div>
            )}
          </label>

          {uploading && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile.size > 0 
                  ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                  : 'Uploaded'
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {uploadedFile && (
        <a
          href={uploadedFile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
        >
          <File className="w-3 h-3" />
          View uploaded file
        </a>
      )}
    </div>
  );
}
