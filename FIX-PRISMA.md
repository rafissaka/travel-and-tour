# Fix Prisma Client Error

The error `Cannot find module '.prisma/client/default'` means the Prisma client needs to be generated.

## Solution (Run from Windows Command Prompt or PowerShell, NOT WSL):

1. **Open Command Prompt or PowerShell** (Run as Administrator if needed)

2. **Navigate to your project:**
   ```cmd
   cd C:\Users\Rahina\tandt\godfirsteducationandtours
   ```

3. **Stop the dev server** (Ctrl+C if it's running)

4. **Run one of these commands:**

   ### Option 1: Generate Prisma Client
   ```cmd
   npx prisma generate
   ```

   ### Option 2: Clean and Regenerate
   ```cmd
   rmdir /s /q node_modules\.prisma
   npx prisma generate
   ```

   ### Option 3: Full Clean Install
   ```cmd
   rmdir /s /q node_modules\.prisma
   rmdir /s /q .next
   npm run dev
   ```

5. **Start dev server:**
   ```cmd
   npm run dev
   ```

## Why This Happens:

- You're running on Windows with WSL
- WSL can't modify Windows files that are locked by Node.js
- Prisma client needs to be generated from Windows side when dev server is stopped

## After Fix:

- Navigate to: http://localhost:3000/profile/applications
- You should see the Applications page working!

---

**Note:** Always run `npx prisma generate` from Windows (not WSL) after schema changes.
