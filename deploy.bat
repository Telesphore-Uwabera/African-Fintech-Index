@echo off
echo 🚀 Starting African Fintech Index Deployment...
echo.

echo 📋 Step 1: Checking Git Status...
git status
echo.

echo 📦 Step 2: Adding All Changes...
git add .
echo.

echo 💾 Step 3: Committing Changes...
git commit -m "Fix CORS configuration and clean up workflows - Deploy updated backend"
echo.

echo 🚀 Step 4: Pushing to GitHub...
git push origin main --force
echo.

echo ✅ Deployment Commands Executed!
echo.
echo 📍 Next Steps:
echo 1. Go to GitHub → Actions tab
echo 2. Watch the workflow run
echo 3. Check Azure for updated backend
echo.
echo 🎯 Your app will be deployed automatically!
pause
