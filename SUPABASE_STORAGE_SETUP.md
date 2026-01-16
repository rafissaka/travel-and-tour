# Supabase Storage Setup Guide

## 📦 Create Storage Bucket

You need to create a storage bucket in Supabase to store user documents.

### Steps:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create "documents" Bucket**
   - Bucket name: `documents`
   - Public bucket: ✅ **Yes** (so users can view their uploaded files)
   - Click "Create bucket"

4. **Set Bucket Policies**
   
   After creating the bucket, you need to set up policies for security:

   **Policy 1: Allow Authenticated Users to Upload**
   ```sql
   CREATE POLICY "Allow authenticated users to upload documents"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'documents' AND
     (storage.foldername(name))[1] = 'user-documents'
   );
   ```

   **Policy 2: Allow Users to Read Their Own Documents**
   ```sql
   CREATE POLICY "Allow users to read documents"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'documents'
   );
   ```

   **Policy 3: Allow Users to Delete Their Own Documents**
   ```sql
   CREATE POLICY "Allow users to delete their own documents"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'documents' AND
     (storage.foldername(name))[1] = 'user-documents'
   );
   ```

   **Policy 4: Allow Public Read Access**
   ```sql
   CREATE POLICY "Allow public to read documents"
   ON storage.objects
   FOR SELECT
   TO public
   USING (
     bucket_id = 'documents'
   );
   ```

5. **Apply Policies in Supabase Dashboard**
   - Go to Storage → documents bucket → Policies
   - Click "New Policy"
   - For each policy above:
     - Click "For full customization"
     - Paste the SQL
     - Click "Review" then "Save policy"

---

## 🎯 How It Works Now

### **Before (Manual Upload):**
1. User uploads file somewhere else
2. User copies URL
3. User pastes URL in form
4. ❌ Complicated and error-prone

### **After (Automatic Upload):**
1. User clicks "Upload Document File"
2. Selects file from computer
3. ✅ File automatically uploads to Supabase
4. ✅ URL automatically filled in form
5. ✅ Progress bar shows upload status
6. ✅ Success message when done

---

## 📁 Folder Structure

Files will be organized like this:

```
documents/
└── user-documents/
    ├── 1704123456789-abc123.pdf
    ├── 1704123457890-def456.jpg
    └── 1704123458901-ghi789.png
```

Each file gets a unique name with:
- Timestamp
- Random string
- Original file extension

---

## 🔐 Security Features

✅ **Only authenticated users can upload**
✅ **Files stored in secure bucket**
✅ **Unique file names prevent conflicts**
✅ **File size limits (10MB default)**
✅ **File type validation**
✅ **Public URLs for easy access**

---

## 🎨 User Experience Features

✅ **Drag and drop support**
✅ **Click to browse files**
✅ **Upload progress bar**
✅ **File size display**
✅ **Preview uploaded file**
✅ **Remove and re-upload**
✅ **Auto-fill document name from file**
✅ **Toast notifications**
✅ **Beautiful UI with icons**

---

## 🚀 Testing

After setup, test by:

1. Go to `/profile/documents`
2. Click "Upload Document"
3. Select document type
4. Click the upload area
5. Select a file (PDF, image, etc.)
6. Watch it upload automatically! 🎉
7. File URL is auto-filled
8. Click "Upload Document" to save

---

## 🐛 Troubleshooting

### "Upload failed: new row violates row-level security policy"
- **Fix**: Make sure you created the storage policies above

### "Bucket not found"
- **Fix**: Create the "documents" bucket in Supabase Dashboard

### "File too large"
- **Default limit**: 10MB
- **Change in code**: Update `maxSizeMB` prop in FileUpload component

### "Cannot read public URL"
- **Fix**: Make sure bucket is set to "Public"

---

## 📝 File Upload Component Props

You can customize the FileUpload component:

```tsx
<FileUpload
  label="Upload File"           // Label text
  required={true}                // Is field required?
  accept=".pdf,.jpg,.png"        // Accepted file types
  maxSizeMB={10}                 // Max file size in MB
  bucketName="documents"         // Supabase bucket name
  folder="user-documents"        // Folder within bucket
  onUploadComplete={(url, fileName, fileSize) => {
    // Called when upload succeeds
    console.log('Uploaded:', url);
  }}
/>
```

---

## 🎉 Benefits

1. **Better UX**: Users don't need to upload files elsewhere first
2. **Faster**: Direct upload to your storage
3. **Secure**: Proper access controls
4. **Organized**: Files organized in folders
5. **Reliable**: No broken external links
6. **Professional**: Clean upload interface

---

## 📦 Alternative: If You Don't Want to Use Supabase Storage

If you prefer a different storage solution:

1. **AWS S3**: Update FileUpload component to use AWS SDK
2. **Cloudinary**: Use Cloudinary upload widget
3. **Google Cloud Storage**: Use GCS client library
4. **Local Storage**: Not recommended for production

The FileUpload component is designed to be easily adaptable to other storage providers!
