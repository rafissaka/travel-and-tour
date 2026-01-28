# Deployment Guide - No Hardcoded Credentials

## 🎯 Overview

This project uses environment variables exclusively for Firebase configuration. No credentials are hardcoded in the codebase.

---

## 🔧 How It Works

### Client-Side (`lib/firebase.ts`)
- Reads Firebase config from `NEXT_PUBLIC_FIREBASE_*` environment variables
- No fallback values - all variables must be set

### Service Worker (`public/firebase-messaging-sw.js`)
- **Auto-generated** at build time by `scripts/generate-firebase-sw.js`
- Injects Firebase config from environment variables
- **Never committed to Git** (in `.gitignore`)

---

## 📋 Required Environment Variables

Add these to `.env.local` (local) and your deployment platform (production):

```bash
# Firebase Client Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Firebase Measurement ID (Optional)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Server-Side - Required for notifications)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key\n-----END PRIVATE KEY-----\n"
```

---

## 🚀 Local Development

### 1. Setup Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials.

### 2. Start Development Server

```bash
npm run dev
```

The script will:
1. Load environment variables from `.env.local`
2. Generate `public/firebase-messaging-sw.js` with your config
3. Start Next.js development server

---

## 📦 Production Deployment

### Vercel

1. **Add Environment Variables**
   - Go to: Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables (7 required)
   - Add all `FIREBASE_ADMIN_*` variables (3 required)
   - Select: Production, Preview, and Development

2. **Deploy**
   ```bash
   git push
   ```
   Or trigger manual deployment in Vercel dashboard

3. **Verify**
   - Visit: `https://your-domain.vercel.app/firebase-messaging-sw.js`
   - Should load successfully (not 404)

### Other Platforms (Netlify, Railway, Render, etc.)

1. **Add Environment Variables**
   - Add all `NEXT_PUBLIC_FIREBASE_*` variables
   - Add all `FIREBASE_ADMIN_*` variables

2. **Deploy**
   - The build script will automatically generate the service worker

3. **Important**: For `FIREBASE_ADMIN_PRIVATE_KEY`
   - Keep the quotes: `"-----BEGIN PRIVATE KEY-----\n..."`
   - Preserve `\n` characters (they represent newlines)

---

## 🔍 How to Get Firebase Credentials

### Client-Side Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click gear icon → Project Settings
4. Under "Your apps" → Web app
5. Copy the config object values

### VAPID Key

1. In Firebase Console → Project Settings
2. Go to "Cloud Messaging" tab
3. Under "Web Push certificates"
4. Copy the "Key pair" value

### Firebase Admin Credentials

1. In Firebase Console → Project Settings
2. Go to "Service Accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract these values from the JSON:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

---

## 🐛 Troubleshooting

### Error: "Missing required Firebase environment variables"

**Problem**: Environment variables not set

**Solution**:
- Check `.env.local` exists and has all required variables
- For production: Verify variables are set in deployment platform
- Run: `node scripts/generate-firebase-sw.js` to see which are missing

### Service Worker 404 Error

**Problem**: Service worker not generated

**Solution**:
- Ensure all environment variables are set
- Run: `node scripts/generate-firebase-sw.js` manually
- Check: `public/firebase-messaging-sw.js` exists

### Build Fails in Production

**Problem**: Environment variables not available during build

**Solution**:
- All `NEXT_PUBLIC_*` variables must be set BEFORE deployment
- After adding variables, trigger a new deployment (rebuild required)

### Notifications Don't Work

**Problem**: Missing or incorrect credentials

**Solution**:
1. Verify service worker loads: `/firebase-messaging-sw.js`
2. Check browser console for errors
3. Verify VAPID key is correct
4. Ensure `FIREBASE_ADMIN_*` variables are set for server-side

---

## 🔒 Security Notes

### Safe to Expose (By Design)
- All `NEXT_PUBLIC_FIREBASE_*` variables (client-side config)
- These are meant to be public and visible in browser
- Security comes from Firebase rules, not hidden keys

### Must Keep Secret
- `FIREBASE_ADMIN_PRIVATE_KEY` (server-side only)
- Never commit to Git
- Only in `.env.local` and deployment platform

### Best Practices
- ✅ All credentials in environment variables
- ✅ `.env.local` in `.gitignore`
- ✅ Service worker auto-generated (not committed)
- ✅ Separate credentials per environment
- ❌ Never hardcode credentials in code
- ❌ Never commit private keys to Git

---

## 📚 Additional Resources

- [Firebase Setup Guide](./FCM_INTEGRATION_GUIDE.md)
- [Environment Variables Template](./.env.example)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🧹 Files Overview

### Generated at Build Time
- `public/firebase-messaging-sw.js` - Auto-generated, not in Git

### Build Scripts
- `scripts/generate-firebase-sw.js` - Generates service worker

### Configuration
- `.env.local` - Local environment variables (not in Git)
- `.env.example` - Template for required variables
- `.gitignore` - Ignores generated files and credentials

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables in `.env.local`
- [ ] `npm run dev` works locally
- [ ] Service worker generates successfully
- [ ] Notifications work in development
- [ ] All variables added to deployment platform
- [ ] No credentials hardcoded in code
- [ ] `.env.local` not committed to Git
- [ ] Service worker not committed to Git

---

Need help? Check that all environment variables are properly set and the build script runs successfully.
