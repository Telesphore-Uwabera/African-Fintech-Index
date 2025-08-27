Write-Host "🚀 Starting African Fintech Index Deployment..." -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 1: Checking Git Status..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "📦 Step 2: Adding All Changes..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "💾 Step 3: Committing Changes..." -ForegroundColor Yellow
git commit -m "Fix CORS configuration and clean up workflows - Deploy updated backend"
Write-Host ""

Write-Host "🚀 Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main --force
Write-Host ""

Write-Host "✅ Deployment Commands Executed!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub → Actions tab"
Write-Host "2. Watch the workflow run"
Write-Host "3. Check Azure for updated backend"
Write-Host ""
Write-Host "🎯 Your app will be deployed automatically!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue..."
