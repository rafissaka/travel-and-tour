# Fix Programs Error - Prisma Client Not Generated

## Error:
```
Error creating program: TypeError: Cannot read properties of undefined (reading 'create')
GET /api/programs 500
```

## Cause:
The Prisma client hasn't been regenerated with the new `Program` model. This happens because:
1. We added the Program model to the schema
2. The database schema was updated
3. But the Prisma client (TypeScript types) wasn't regenerated
4. WSL/Linux cannot regenerate it due to Windows file permission issues

## Solution:

### Option 1: Run UPDATE-SCHEMA.bat (Recommended)
**This will do everything automatically:**

1. **Open Windows Command Prompt** (NOT WSL/Linux terminal)
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Navigate to your project:**
   ```cmd
   cd C:\Users\Rahina\tandt\godfirsteducationandtours
   ```

3. **Run the batch file:**
   ```cmd
   UPDATE-SCHEMA.bat
   ```

This will:
- Stop any running Node.js processes
- Update the database schema
- Generate Prisma client
- Migrate "Stipendium Hungaricum" from Service to Program
- Ready for restart

### Option 2: Manual Steps (If batch file doesn't work)

1. **Stop dev server** (Ctrl+C in terminal)

2. **Kill all Node processes** (Windows CMD):
   ```cmd
   taskkill /F /IM node.exe
   ```

3. **Generate Prisma client** (Windows CMD):
   ```cmd
   npx prisma generate
   ```

4. **Push schema to database** (if not done already):
   ```cmd
   npx prisma db push --skip-generate
   ```

5. **Restart dev server**:
   ```cmd
   npm run dev
   ```

## Verification:

After running the fix, you should see:
- ✅ Programs admin page loads without errors
- ✅ You can create programs under services
- ✅ Programs appear on service detail pages
- ✅ Application form shows program selector

## What Changed:

The Programs feature has been fully implemented:
- **Database**: Program model with all fields
- **API**: `/api/programs` with full CRUD
- **Admin UI**: `/profile/programs` to manage programs
- **User UI**: Programs shown on service pages
- **Applications**: Users can select programs when applying

---

**After fixing, programs will only be available under "Study & Summer Programs Abroad" service by default.**
