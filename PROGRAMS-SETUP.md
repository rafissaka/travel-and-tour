# Programs Feature Setup Guide

You now have a **hierarchical system** where Programs belong to Services!

## What Changed:

### Database Structure:
```
Service (e.g., "Study & Summer Programs Abroad")
  └── Programs (e.g., "Stipendium Hungaricum", "Erasmus+", etc.)
      └── Applications (users apply to specific programs)
```

### New Features:
✅ **Programs Model** - Linked to Services
✅ **Programs API** - Full CRUD operations
✅ **Program-Application Link** - Applications can be linked to specific programs
✅ **Migration Script** - Moves "Stipendium Hungaricum" from Service to Program

---

## How to Complete the Setup:

### ⚠️ IMPORTANT: If you see "Cannot read properties of undefined (reading 'create')" error:
**Follow FIX-PROGRAMS-ERROR.md first!**

### Step 1: Run the Update Script (Windows CMD/PowerShell)

**Method A: Double-click**
- Navigate to: `C:\Users\Rahina\tandt\godfirsteducationandtours`
- Double-click `UPDATE-SCHEMA.bat`

**Method B: Command Line**
1. Open Windows Command Prompt (NOT WSL)
2. Run:
```cmd
cd C:\Users\Rahina\tandt\godfirsteducationandtours
UPDATE-SCHEMA.bat
```

This will:
1. Stop Node.js processes
2. Update database schema
3. Generate Prisma client ✅ **This fixes the error!**
4. Migrate "Stipendium Hungaricum" to a Program
5. Ready for dev server restart

### Step 2: Restart Dev Server
```cmd
npm run dev
```

### Step 3: Verify Everything Works
1. Go to `/profile/programs` as admin
2. You should see the page load without errors
3. "Study & Summer Programs Abroad" should be the only service option
4. Create a test program

---

## How It Works Now:

### For Admins:

1. **Create Services** (Main Categories)
   - Go to `/profile/services`
   - Create services like "Study & Summer Programs Abroad"

2. **Create Programs** (Under Services)
   - Go to `/profile/programs` (coming next)
   - Select parent service
   - Add program details:
     - Title: "Stipendium Hungaricum Scholarship"
     - Country: "Hungary"
     - University: "Various Hungarian Universities"
     - Duration: "3-5 years"
     - Features, Requirements, Benefits
     - Tuition fees, Application fees
     - Deadline, Available slots

### For Users:

1. **Browse Services**
   - Visit `/services`
   - Click "Study & Summer Programs Abroad"

2. **View Programs**
   - See all programs under that service:
     - Stipendium Hungaricum
     - Erasmus+
     - DAAD Scholarships
     - etc.

3. **Apply to Program**
   - Click "Apply" on a specific program
   - Fill application form
   - Application is linked to that program

---

## API Endpoints Created:

### Programs API (`/api/programs`)
- **GET** - Fetch all programs or filter by service
  - `/api/programs` - All programs
  - `/api/programs?serviceId=xxx` - Programs for specific service
  - `/api/programs?active=true` - Only active programs
  - `/api/programs?slug=stipendium-hungaricum` - Specific program

- **POST** - Create new program (Admin only)
- **PATCH** - Update program (Admin only)
- **DELETE** - Delete program (Admin only)

---

## Next Steps (I'll create these):

1. ✅ Programs database model
2. ✅ Programs API routes
3. ⏳ Programs admin management page
4. ⏳ Update service detail page to show programs
5. ⏳ Link application form to programs
6. ⏳ Program detail pages for users

---

## Program Fields:

### Basic Info:
- Title, Slug, Tagline
- Description, Full Description
- Image

### Program Specifics:
- Country
- University/Institution
- Duration
- Start Date, End Date
- Application Deadline

### Features & Requirements:
- Features (array)
- Requirements (array)
- Benefits (array)

### Financial:
- Tuition Fee
- Application Fee
- Scholarship Type

### Status:
- Is Active
- Display Order
- Available Slots

---

## Example: Stipendium Hungaricum

After running the script, "Stipendium Hungaricum" will be:
- **Removed** from main services list
- **Added** as a Program under "Study & Summer Programs Abroad"
- Users will see it when they click on "Study & Summer Programs Abroad"

---

## Benefits of This Structure:

✅ **Better Organization** - Services contain multiple programs
✅ **Easier Management** - Add/remove programs without affecting services
✅ **Flexible Applications** - Users apply to specific programs
✅ **Better Analytics** - Track applications per program
✅ **Scalable** - Add unlimited programs to any service

---

**Run UPDATE-SCHEMA.bat now to complete the setup!**
