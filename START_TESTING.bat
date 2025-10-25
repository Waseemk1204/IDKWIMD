@echo off
echo ========================================
echo Local Testing Setup
echo ========================================
echo.
echo This will guide you through testing the blockchain integration locally.
echo.
echo Step 1: Install Frontend Dependencies
echo ----------------------------------------
echo Run this command in a NEW terminal:
echo   npm install
echo.
echo Press any key when frontend npm install is complete...
pause > nul
echo.
echo Step 2: Install Backend Dependencies
echo ----------------------------------------
echo Run these commands in a NEW terminal:
echo   cd backend
echo   npm install
echo.
echo Press any key when backend npm install is complete...
pause > nul
echo.
echo Step 3: Start MongoDB
echo ----------------------------------------
echo Make sure MongoDB is running.
echo If using local MongoDB, run in a NEW terminal AS ADMINISTRATOR:
echo   net start MongoDB
echo.
echo Press any key when MongoDB is running...
pause > nul
echo.
echo Step 4: Start Backend Server
echo ----------------------------------------
echo In a NEW terminal, run:
echo   cd backend
echo   npm run dev
echo.
echo You should see:
echo   - Server running on port 5000
echo   - MongoDB connected successfully
echo   - Blockchain service message
echo.
echo Press any key when backend server is running...
pause > nul
echo.
echo Step 5: Start Frontend Server
echo ----------------------------------------
echo In ANOTHER NEW terminal, run:
echo   npm run dev
echo.
echo You should see:
echo   - VITE ready
echo   - Local: http://localhost:5173/
echo.
echo Press any key when frontend server is running...
pause > nul
echo.
echo Step 6: Open Browser
echo ----------------------------------------
echo Opening browser to http://localhost:5173/...
echo.
start http://localhost:5173/
echo.
echo ========================================
echo Testing Checklist
echo ========================================
echo.
echo [ ] Homepage loads without errors
echo [ ] Can navigate to Register page
echo [ ] Can create employer account
echo [ ] Post Job page shows payment method selector
echo [ ] Both Crypto and Razorpay options visible
echo [ ] Wallet widget appears on dashboard
echo [ ] No red errors in browser console (F12)
echo [ ] Backend console shows "Server running"
echo.
echo ========================================
echo If all checks pass, you're ready!
echo ========================================
echo.
echo Next steps:
echo   1. Deploy smart contract via Remix
echo   2. Test full blockchain flow
echo   3. Commit and push to GitHub
echo.
echo See LOCAL_TEST_INSTRUCTIONS.md for detailed testing steps.
echo.
pause


