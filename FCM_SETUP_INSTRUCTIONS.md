# Firebase Cloud Messaging (FCM) Setup Instructions

Your FCM integration is ready! Follow these steps to complete the setup and start sending push notifications.

## 📋 Quick Overview

Your notification system is **fully implemented** with:
- ✅ Database notifications (already working)
- ✅ In-app notification center (already working)
- ✅ Notification bell in navbar (already working)
- ✅ FCM client-side code (ready)
- ✅ FCM backend code (ready)
- ✅ Service worker for background notifications (ready)
- ⏳ Just needs Firebase Admin credentials to enable push notifications

---

## 🚀 Step 1: Install Dependencies

Run this command in your project directory:

```bash
bun add firebase firebase-admin
```

Or if using npm:

```bash
npm install firebase firebase-admin
```

---

## 🔑 Step 2: Get Firebase Admin Credentials

### A. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **godfirsteducation-and-tours**

### B. Generate Service Account Key
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **Project Settings**
3. Go to **Service Accounts** tab
4. Click **"Generate new private key"** button
5. Confirm by clicking **"Generate key"**
6. A JSON file will be downloaded - **keep this file secure!**

### C. Get VAPID Key (Web Push Certificate)
1. In Firebase Console, go to **Project Settings**
2. Click on **Cloud Messaging** tab
3. Scroll down to **Web configuration**
4. Under **Web Push certificates**, you'll see your **Key pair**
5. If no key exists, click **"Generate key pair"**
6. Copy the key (starts with `B...`)

---

## 🔐 Step 3: Add Environment Variables

### Open your `.env.local` file and add:

```env
# ====================================
# Firebase Client Configuration
# ====================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB-jVj7-YUb07udtnwsxAkqa8RwWYuumsY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=godfirsteducation-and-tours.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=godfirsteducation-and-tours
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=godfirsteducation-and-tours.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972138896496
NEXT_PUBLIC_FIREBASE_APP_ID=1:972138896496:web:155fd40c52c40c698428b5
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE

# ====================================
# Firebase Admin SDK Configuration
# ====================================
FIREBASE_ADMIN_PROJECT_ID=godfirsteducation-and-tours
FIREBASE_ADMIN_CLIENT_EMAIL=YOUR_CLIENT_EMAIL_HERE
FIREBASE_ADMIN_PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
```

### How to fill in the Admin SDK values:

1. Open the JSON file you downloaded in Step 2B
2. Find these values in the JSON:
   - `project_id` → Copy to `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → Copy to `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → Copy to `FIREBASE_ADMIN_PRIVATE_KEY` (keep the quotes!)

**Example:**
```json
{
  "project_id": "godfirsteducation-and-tours",
  "client_email": "firebase-adminsdk-xxxxx@godfirsteducation-and-tours.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
}
```

Becomes:
```env
FIREBASE_ADMIN_PROJECT_ID=godfirsteducation-and-tours
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@godfirsteducation-and-tours.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANT**: 
- Keep the quotes around `FIREBASE_ADMIN_PRIVATE_KEY`
- Keep the `\n` characters in the private key
- Never commit `.env.local` to Git!

---

## 🎨 Step 4: Add Notification Icons

Create placeholder icon files or use your logo:

### Option A: Quick Placeholder Icons
Create these files in the `public` folder:

```bash
# Navigate to public folder
cd public

# Create placeholder icons (you can use any tool or your logo)
# The icons should be PNG format with the following sizes:
# - icon-192x192.png (192x192 pixels)
# - icon-512x512.png (512x512 pixels)
# - badge-72x72.png (72x72 pixels) - smaller badge icon
# - icon-96x96.png (96x96 pixels)
```

### Option B: Use Your Logo
Use your existing logo and resize it to the required sizes. You can use tools like:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://progressier.com/pwa-icons-generator)
- Any image editing software (Photoshop, GIMP, etc.)

---

## 📱 Step 5: Update Root Layout

Add the manifest link to your `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add this line */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

---

## 🧪 Step 6: Test the Setup

### A. Start Your Development Server

```bash
bun run dev
# or
npm run dev
```

### B. Test Notification Flow

1. **Open your app** in a browser (must be HTTPS in production)
2. **Login or signup** - FCM token will be requested automatically
3. **Check browser console** - you should see:
   - "Service Worker registered"
   - "FCM Token obtained: Success"
4. **Test creating a booking** or **application** - you should receive:
   - In-app notification (bell icon updates)
   - Push notification (if browser permission granted)

### C. Check Database

```sql
-- Check if device tokens are being saved
SELECT * FROM "DeviceToken" WHERE "isActive" = true;

-- Check if notifications are being created
SELECT * FROM "Notification" ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 🔧 Step 7: Production Deployment

### Vercel/Netlify/Other Platforms

Add all environment variables from Step 3 to your deployment platform:

**Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable from your `.env.local`
4. Redeploy your application

**Important for Production:**
- Ensure your domain uses **HTTPS** (required for service workers)
- Test push notifications on production URL
- Check browser console for any errors

---

## 🎯 How It Works

### User Flow:
1. **User logs in/signs up** → FCM token automatically requested and saved
2. **User grants notification permission** → Browser shows native permission prompt
3. **Action triggers notification** (booking, application, etc.) → System sends:
   - Database notification (shown in notification bell)
   - Push notification (if user has granted permission)

### Multiple Device Support:
- Each device gets its own FCM token
- Tokens are stored in `DeviceToken` table
- When notification is sent, it goes to **all active devices**
- Invalid/expired tokens are automatically deactivated

### Notification Types Already Integrated:
- ✅ New booking received
- ✅ Booking status changed
- ✅ New application submitted
- ✅ Application status changed
- ✅ Admin alerts for new bookings/applications

---

## 🐛 Troubleshooting

### Issue: "Service Worker registration failed"
**Solution:**
- Ensure you're on HTTPS (or localhost)
- Check that `firebase-messaging-sw.js` exists in `public` folder
- Clear browser cache and reload

### Issue: "No FCM token obtained"
**Solution:**
- Check that VAPID key is correct in `.env.local`
- Ensure notification permission is granted
- Check browser console for specific errors
- Try in an incognito window

### Issue: "Push notifications not received"
**Solution:**
1. Check that Firebase Admin credentials are correct
2. Verify device token is saved in database
3. Check server logs for FCM errors
4. Ensure browser/device supports push notifications
5. Test with Firebase Console > Cloud Messaging > Send test message

### Issue: "Firebase Admin initialization error"
**Solution:**
- Double-check the private key format in `.env.local`
- Ensure private key has quotes around it
- Verify `\n` characters are present
- Restart development server after changing env vars

---

## 📊 Testing Push Notifications

### Test from Firebase Console:
1. Go to Firebase Console > **Cloud Messaging**
2. Click **"Send your first message"** or **"New campaign"**
3. Enter notification title and body
4. Click **"Send test message"**
5. Enter FCM token from database or browser console
6. Click **"Test"**

### Test from Your App:
Create a test API endpoint or use the existing notification system:

```typescript
// Test by creating a booking or application
// The system will automatically send notifications
```

---

## 🎉 Success Checklist

- [ ] Firebase dependencies installed (`firebase`, `firebase-admin`)
- [ ] Environment variables added to `.env.local`
- [ ] Firebase Admin credentials configured
- [ ] VAPID key added
- [ ] Notification icons created
- [ ] Manifest linked in layout
- [ ] Service worker registers successfully
- [ ] FCM tokens saving to database on login/signup
- [ ] In-app notifications working (bell icon)
- [ ] Push notifications working (browser notifications)
- [ ] Tested on multiple devices
- [ ] Production environment variables configured

---

## 📚 Additional Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Manifest Guide](https://web.dev/add-manifest/)

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check server logs for backend errors
3. Verify all environment variables are set
4. Ensure HTTPS is enabled in production
5. Test with a fresh browser session (incognito)

**Your notification system is production-ready!** Just add the environment variables and start sending push notifications! 🚀
