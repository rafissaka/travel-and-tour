@echo off
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Cleaning old Prisma client...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
)

echo.
echo Cleaning Next.js cache...
if exist ".next" (
    rmdir /s /q ".next"
)

echo.
echo Generating Prisma client...
call npx prisma generate

echo.
echo Done! Now run: npm run dev
pause
