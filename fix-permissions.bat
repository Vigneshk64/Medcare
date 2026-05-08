@echo off
echo 🔥 Fixing Firebase Permissions...
echo.
echo Step 1: Installing Firebase CLI...
call npm install -g firebase-tools
echo.
echo Step 2: Deploying Security Rules...
call firebase deploy --only firestore:rules
echo.
echo ✅ Firebase permissions fixed!
echo.
echo 🌐 Open: http://localhost:3001
echo 📋 Check browser console for Firebase logs
pause
