# Cloudinary Setup for Document Uploads

The application form now includes document upload functionality using Cloudinary.

## Environment Variables Needed

Add these to your `.env` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## How to Get Cloudinary Credentials:

1. **Sign up at Cloudinary** (if you don't have an account):
   - Go to: https://cloudinary.com/users/register/free
   - Create a free account

2. **Get your credentials:**
   - After signing in, go to your Dashboard
   - You'll see:
     - **Cloud Name** (e.g., "dxxxxxxxx")
     - **API Key** (e.g., "123456789012345")
     - **API Secret** (click "Reveal" to see it)

3. **Add to `.env` file:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxx
   ```

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Features:

✅ **Upload Documents:**
- Passport copy
- Passport photo
- Birth certificate
- Academic transcripts
- WASSCE results
- Medical results
- School certificates

✅ **File Validation:**
- Accepted formats: JPG, PNG, PDF
- Max file size: 10MB per document
- Automatic image optimization

✅ **File Management:**
- Preview uploaded documents
- Download documents
- Remove and re-upload documents
- Organized by user ID and document type

## Document Structure in Cloudinary:

Files are organized in folders:
```
applications/
  └── {userId}/
      ├── passport/
      ├── photo/
      ├── birthCertificate/
      ├── transcript/
      ├── wassce/
      ├── medicalResults/
      └── schoolCertificate/
```

## Security:

- Only authenticated users can upload
- Files are uploaded to secure Cloudinary servers
- URLs are stored in database
- Files can be deleted via API

---

**Note:** The free Cloudinary plan includes:
- 25GB storage
- 25GB bandwidth/month
- Perfect for application documents!
