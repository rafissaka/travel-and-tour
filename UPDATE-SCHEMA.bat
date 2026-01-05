@echo off
echo Stopping any running processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Updating database schema...
echo.

REM Push schema changes
call npx prisma db push --skip-generate

echo.
echo Schema updated! Now generating Prisma client...
echo.

REM Generate Prisma client
call npx prisma generate

echo.
echo Migrating Stipendium Hungaricum to Program...
call npx tsx scripts/migrate-service-to-program.ts

echo.
echo Done! Now run: npm run dev
pause
