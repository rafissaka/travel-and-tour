# 🧪 Testing the Reservation System - Step by Step

## 🚀 Test Session Started

### **Step 1: Start the Development Server**
```bash
npm run dev
```
Server should be running at: http://localhost:3000

---

## 📋 Test Checklist

### **Test 1: Access the Reservations Page**
- [ ] Navigate to `http://localhost:3000/services/reservations`
- [ ] Page loads successfully
- [ ] See 3 tabs: Flights Only | Hotels Only | Flight + Hotel Package
- [ ] Default tab is "Flights Only"

### **Test 2: Flight Search Form**
- [ ] Fill in flight search:
  - From: `ACC`
  - To: `LHR`
  - Departure Date: Pick a date 2+ weeks from today
  - Return Date: Optional (leave blank for one-way or pick return date)
  - Adults: `1`
  - Cabin: `Economy`
- [ ] Click "Search Flights" button
- [ ] Loading spinner appears
- [ ] Wait for results (may take 5-10 seconds)

### **Test 3: Flight Results Display**
- [ ] Results appear in beautiful cards
- [ ] See flight details:
  - Airline name
  - Departure/arrival times
  - Duration
  - Number of stops
  - Route visualization with plane icon
- [ ] See pricing in GH₵:
  - Base Price
  - Service Fee (10%)
  - Total Amount
  - USD price shown below
- [ ] Hover over cards - see hover effects

### **Test 4: Select a Flight**
- [ ] Click on any flight card
- [ ] Card border turns blue (primary color)
- [ ] "Selected" badge appears
- [ ] Info message shows at bottom of card
- [ ] Sticky "Request Quote" button appears at bottom of page

### **Test 5: Request Flight Quote**
- [ ] Click the green "Request Quote" button
- [ ] Modal opens with backdrop blur
- [ ] See quote summary with:
  - Route details
  - Airline
  - Dates
  - Passenger count
- [ ] See pricing breakdown:
  - Base Price USD
  - Base Price GHS
  - Service Fee (10%)
  - Total Amount in GH₵
- [ ] See "What happens next?" info box
- [ ] Can add optional notes in textarea

### **Test 6: Submit Flight Quote**
- [ ] Click "Request Quote" button in modal
- [ ] Loading spinner appears
- [ ] Success toast notification appears
- [ ] Modal closes
- [ ] Results cleared
- [ ] Ready for new search

---

### **Test 7: Hotel Search**
- [ ] Click "Hotels Only" tab
- [ ] Fill in hotel search:
  - City Code: `LON`
  - Check-in: Pick a date 2+ weeks from today
  - Check-out: Pick 2-3 nights later
  - Adults: `2`
  - Rooms: `1`
- [ ] Click "Search Hotels" button
- [ ] Loading spinner appears
- [ ] Wait for results (may take 10-15 seconds)

### **Test 8: Hotel Results Display**
- [ ] Results appear in 3-column grid (responsive)
- [ ] See hotel cards with:
  - Hotel name
  - Star rating (5 stars)
  - Location
  - Room type
  - Price per night
  - Total for all nights
  - Service fee
  - Final total in GH₵
- [ ] Cards have purple gradient placeholder images
- [ ] Hover effects work

### **Test 9: Select a Hotel**
- [ ] Click on any hotel card
- [ ] Card border turns purple (primary color)
- [ ] "Selected" badge appears on image
- [ ] Info message shows at bottom
- [ ] "Request Quote" button appears

### **Test 10: Submit Hotel Quote**
- [ ] Click "Request Quote" button
- [ ] Modal opens with hotel details
- [ ] See pricing breakdown
- [ ] Add optional notes
- [ ] Click "Request Quote"
- [ ] Success notification
- [ ] Modal closes

---

### **Test 11: Package Tab**
- [ ] Click "Flight + Hotel Package" tab
- [ ] See package information
- [ ] See two buttons:
  - "Start with Flights"
  - "Start with Hotels"
- [ ] Note mentions 5% discount

---

### **Test 12: Verify Database**
Open your database and check:

```sql
-- Check flight quotes
SELECT 
  id, 
  origin, 
  destination, 
  departure_date,
  airline,
  total_amount,
  status,
  created_at
FROM flight_reservations
ORDER BY created_at DESC
LIMIT 5;

-- Check hotel quotes
SELECT 
  id, 
  hotel_name, 
  city,
  check_in_date,
  check_out_date,
  total_amount,
  status,
  created_at
FROM hotel_reservations
ORDER BY created_at DESC
LIMIT 5;
```

Expected:
- [ ] Quotes appear in database
- [ ] Status = `PENDING_QUOTE`
- [ ] Payment Status = `PENDING`
- [ ] All details saved correctly
- [ ] Pricing calculated correctly

---

### **Test 13: Error Handling**
- [ ] Try invalid airport code (e.g., `XXX`)
- [ ] Should show error message
- [ ] Try past dates
- [ ] Form validation should prevent

---

### **Test 14: Mobile Responsiveness**
- [ ] Open in mobile view (browser DevTools)
- [ ] Tabs stack vertically
- [ ] Forms are easy to use
- [ ] Cards display properly
- [ ] Modal fits screen
- [ ] Everything readable

---

## 🐛 Issues Found

Document any issues here:

1. 
2. 
3. 

---

## ✅ Test Results

### Overall Status: [ ] PASS / [ ] FAIL

### What Works:
- 
- 
- 

### What Needs Fixing:
- 
- 
- 

---

## 📝 Notes

Add any observations or suggestions:


---

**Tester:** _________________
**Date:** _________________
**Time:** _________________
