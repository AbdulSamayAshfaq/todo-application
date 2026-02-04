#!/usr/bin/env pwsh
# Hugging Face Spaces Deployment Script

Write-Host "🚀 Starting Hugging Face Spaces Deployment..." -ForegroundColor Green
Write-Host ""

# Check if HF CLI is installed
try {
    hf --version | Out-Null
    Write-Host "✅ HF CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ HF CLI not found. Installing..." -ForegroundColor Yellow
    powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"
}

# Check if logged in
try {
    hf whoami | Out-Null
    Write-Host "✅ Logged in to Hugging Face" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in. Please run 'hf login'" -ForegroundColor Red
    Write-Host "   Get your token from: https://huggingface.co/settings/tokens" -ForegroundColor Yellow
    exit 1
}

# Clone the space (if not already cloned)
$spaceUrl = "https://huggingface.co/spaces//todo-bkAbdulsamay"
$spaceDir = "todo-bk"

if (Test-Path $spaceDir) {
    Write-Host "📁 Space directory already exists. Pulling latest changes..." -ForegroundColor Yellow
    Push-Location $spaceDir
    git pull
    Pop-Location
} else {
    Write-Host "📥 Cloning space..." -ForegroundColor Yellow
    git clone $spaceUrl
}

# Copy files to the space
Write-Host "📋 Copying project files to space..." -ForegroundColor Yellow

# Copy backend
Copy-Item -Path "backend" -Destination "$spaceDir/backend" -Recurse -Force

# Copy AI agent
Copy-Item -Path "ai-agent" -Destination "$spaceDir/ai-agent" -Recurse -Force

# Copy HF Space files
Copy-Item -Path "huggingface_space/app.py" -Destination "$spaceDir/app.py" -Force
Copy-Item -Path "huggingface_space/Dockerfile" -Destination "$spaceDir/Dockerfile" -Force
Copy-Item -Path "huggingface_space/README.md" -Destination "$spaceDir/README.md" -Force

# Deploy to HF Spaces
Write-Host ""
Write-Host "🚀 Deploying to Hugging Face Spaces..." -ForegroundColor Green
Push-Location $spaceDir

# Add and commit changes
git add .
$commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

# Push to HF
git push

Pop-Location

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "   Your Space: https://huggingface.co/spaces/Abdulsamay/todo-bk" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Go to your Space settings" -ForegroundColor White
Write-Host "   2. Add your API key as a secret (OPENAI_API_KEY)" -ForegroundColor White
Write-Host "   3. The Space will automatically rebuild" -ForegroundColor White
