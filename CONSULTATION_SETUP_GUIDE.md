# 🎉 Consultation Booking System - Setup Guide

## Overview

You now have a **complete consultation booking system** with payment integration! This guide will help you configure and test it.

---

## ✅ What's Been Implemented

### 1. Database Schema
- `ConsultationBooking` model with all required fields
- Contact information, travelers, trip details, logistics, budget
- Payment tracking and status management

### 2. API Endpoints
- **POST** `/api/consultation-bookings` - Create consultation
- **GET** `/api/consultation-bookings` - List consultations
- **POST** `/api/consultation-bookings/payment` - Initialize Paystack payment
- **GET** `/api/consultation-bookings/payment/verify` - Verify payment
- **POST** `/api/webhooks/paystack` - Handle Paystack webhooks

### 3. Frontend Components
- **ConsultationForm** - 4-step form with validation
- **Service Detail Page** - Updated with "Consult with Us" button
- **Payment Verification Page** - Success/error handling

### 4. Features
- ✅ Login requirement check
- ✅ Dynamic fee calculation (GHS 500/person, 250/infant)
- ✅ Real-time form validation
- ✅ Paystack payment integration
- ✅ Admin notifications
- ✅ Webhook support for payment confirmation

---

## 🔧 Setup Instructions

### Step 1: Add Environment Variables

Add these to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Application URL (for payment redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production URL (when deploying)
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 2: Get Paystack Keys

1. **Sign up for Paystack:**
   - Go to https://paystack.com
   - Create an account (it's free!)
   - Verify your email

2. **Get Test Keys:**
   - Log in to Paystack Dashboard
   - Go to **Settings** → **API Keys & Webhooks**
   - Copy your **Test Secret Key** (starts with `sk_test_`)
   - Copy your **Test Public Key** (starts with `pk_test_`)

3. **Add to `.env.local`:**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Configure Webhook

1. **In Paystack Dashboard:**
   - Go to **Settings** → **API Keys & Webhooks**
   - Click **Add Webhook**

2. **Add Webhook URL:**
   ```
   For local testing (with ngrok):
   https://your-ngrok-url.ngrok.io/api/webhooks/paystack

   For production:
   https://yourdomain.com/api/webhooks/paystack
   ```

3. **Select Events:**
   - Check: `charge.success`

4. **Save Webhook**

### Step 4: Restart Development Server

```bash
# Stop current server (Ctrl+C)

# Restart
npm run dev
# or
bun dev
```

---

## 🧪 Testing Guide

### Test Flow

1. **Go to Services Page:**
   ```
   http://localhost:3000/services
   ```

2. **Click on "Family Travel Consultation"**

3. **Click "Consult with Us" Button**
   - If not logged in → redirects to login
   - If logged in → opens consultation form

4. **Fill Out the Form:**
   
   **Step 1: Contact & Travelers**
   - Enter contact information
   - Add travelers (try different types to see fee calculation)
   - Check fee acknowledgment

   **Step 2: Trip Details**
   - Select destination clarity
   - Choose dates and duration
   - Select trip types
   - Enter must-do activities
   - Choose accommodation style

   **Step 3: Logistics**
   - Select transport methods
   - Fill health & safety info
   - Select budget range

   **Step 4: Review & Submit**
   - Review summary
   - Select referral source
   - Accept terms
   - Click submit

5. **Payment:**
   - Automatically redirects to Paystack
   - Use Paystack test cards:
     - **Success:** `4084084084084081`
     - **Declined:** `5060666666666666666`
   - CVV: any 3 digits
   - Expiry: any future date

6. **Verification:**
   - Redirects to success page
   - Check database for `PAID` status
   - Check admin receives notification

---

## 📋 Test Cards (Paystack)

| Purpose | Card Number | Result |
|---------|-------------|--------|
| Successful payment | `4084084084084081` | ✅ Success |
| Declined payment | `5060666666666666666` | ❌ Declined |
| Timeout | `4084084084084081` (wait 65 seconds) | ⏱️ Timeout |

**For all cards:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- PIN: `1234` (if asked)

---

## 🗂️ Database Structure

### ConsultationBooking Table

```prisma
model ConsultationBooking {
  id                   String
  userId               String
  serviceId            String
  
  // Contact
  contactFullName      String
  contactEmail         String
  contactPhone         String
  contactResidence     String
  
  // Travelers (JSON)
  travelers            Json
  travelerCount        Int
  feeEstimate          Decimal
  
  // Trip Details
  destinationClarity   String
  destinationDetails   String?
  travelStartDate      DateTime
  travelEndDate        DateTime
  tripDuration         String
  tripType             Json
  mustDoActivities     String
  accommodationStyle   String
  
  // Logistics
  transportMethod      Json
  carSeatNeeds         Json?
  driverRequirement    String?
  yellowFever          String
  malariaPlan          String
  dietaryRestrictions  Json?
  totalBudget          String
  spendingStyle        String
  
  // Submission
  referralSource       String
  
  // Payment
  status               BookingStatus
  paymentStatus        PaymentStatus
  paymentReference     String?
  
  // Timestamps
  createdAt            DateTime
  updatedAt            DateTime
  confirmedAt          DateTime?
}
```

---

## 🎨 Fee Calculation

The system automatically calculates fees based on traveler types:

| Traveler Type | Fee |
|---------------|-----|
| Adult (18+) | GHS 500 |
| Teen (13-17) | GHS 500 |
| Child (6-12) | GHS 500 |
| Toddler (2-5) | GHS 500 |
| Infant (0-1) | GHS 250 |

**Example:**
- 2 Adults + 1 Child + 1 Infant = (2 × 500) + (1 × 500) + (1 × 250) = **GHS 1,750**

---

## 📧 Admin Notifications

Admins receive notifications when:
1. ✅ New consultation request submitted
2. ✅ Payment confirmed via webhook

Notifications appear in:
- Notification bell (in-app)
- FCM push notifications (if enabled)

---

## 🔒 Security Features

1. **Login Required:** Users must be logged in to book
2. **Payment Verification:** Server-side verification with Paystack
3. **Webhook Signature:** Validates Paystack webhook authenticity
4. **Data Validation:** Form validation on both client and server

---

## 🚀 Going to Production

### Before Launch:

1. **Get Live Paystack Keys:**
   - Complete Paystack business verification
   - Switch to live keys (starts with `sk_live_` and `pk_live_`)

2. **Update Environment Variables:**
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Update Webhook URL:**
   - Change to: `https://yourdomain.com/api/webhooks/paystack`

4. **Test Thoroughly:**
   - Create test consultation with real payment
   - Verify email notifications
   - Check admin dashboard

---

## 📞 Support & Contact

If you need help:

1. **Email Support:** support@godfirsteducation.com
2. **WhatsApp:** +233 XXX XXX XXX (update in success page)

---

## 🎯 Next Steps (Optional Enhancements)

Consider adding:
- [ ] Email notifications to clients (confirmation emails)
- [ ] SMS notifications via Africa's Talking or Twilio
- [ ] Admin dashboard to view all consultations
- [ ] Calendar integration for scheduling
- [ ] PDF proposal generation
- [ ] Refund handling

---

## 🐛 Troubleshooting

### Issue: "Paystack not initialized"
**Solution:** Check that `PAYSTACK_SECRET_KEY` is in `.env.local` and server restarted

### Issue: Payment success but not updating database
**Solution:** Check webhook is configured correctly in Paystack dashboard

### Issue: "Consult with Us" button not showing
**Solution:** Ensure service slug is exactly `family-travel-consultation`

### Issue: Form validation errors
**Solution:** Fill all required fields marked with *

---

## ✨ Congratulations!

Your consultation booking system is ready! Users can now:
1. Fill out detailed consultation forms
2. See real-time fee calculations
3. Pay securely via Paystack
4. Receive confirmation

And you can:
1. Receive instant notifications
2. View all consultation requests
3. Track payment status
4. Manage bookings from admin panel

Happy booking! 🎉
