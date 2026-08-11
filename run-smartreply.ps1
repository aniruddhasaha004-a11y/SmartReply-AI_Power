# SmartReply Launcher Script (Windows Powershell)
# This script configures and launches the full-stack project automatically.

Clear-Host
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   SmartReply - Full-Stack Launcher Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Load or Create .env File Configuration
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating configuration template (.env)..." -ForegroundColor Yellow
    New-Item -ItemType File -Path $envFile -Value "GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE`nMONGODB_URI=mongodb://localhost:27017/smartreply" | Out-Null
}

# Read variables from .env
$config = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split '=', 2
        if ($parts.Length -eq 2) {
            $config[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
}

$geminiKey = $config["GEMINI_API_KEY"]
$mongoUri = $config["MONGODB_URI"]

# Prompt user for Gemini Key if not configured
if ($geminiKey -eq "YOUR_GEMINI_API_KEY_HERE" -or -not $geminiKey) {
    Write-Host "Google Gemini API Key is required to generate AI emails." -ForegroundColor Yellow
    Write-Host "Get a free key from Google AI Studio: https://aistudio.google.com/" -ForegroundColor Gray
    $inputKey = Read-Host "Please paste your Google Gemini API Key"
    if ($inputKey) {
        $geminiKey = $inputKey.Trim()
        # Save back to .env
        $content = Get-Content $envFile
        $content = $content -replace "GEMINI_API_KEY=.*", "GEMINI_API_KEY=$geminiKey"
        Set-Content $envFile -Value $content
        Write-Host "Saved Gemini API Key to .env file." -ForegroundColor Green
    } else {
        Write-Host "Warning: Proceeding without Gemini API Key. AI generations will fail." -ForegroundColor Red
    }
}

# 2. Check and Setup Portable Maven inside backend/
$mvnBinPath = Join-Path (Get-Location) "backend\maven-bin"
if (-not (Test-Path $mvnBinPath)) {
    Write-Host "Local Maven build tool not found. Downloading Apache Maven..." -ForegroundColor Yellow
    $zipFile = "maven.zip"
    $mavenVersion = "3.9.6"
    $downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile
        Write-Host "Extracting Maven package..." -ForegroundColor Yellow
        
        # Create temp folder for extraction
        $tempExtract = "maven-temp"
        New-Item -ItemType Directory -Path $tempExtract -Force | Out-Null
        Expand-Archive -Path $zipFile -DestinationPath $tempExtract
        
        # Move package to backend/maven-bin
        $extractedFolder = Join-Path $tempExtract "apache-maven-$mavenVersion"
        Move-Item -Path $extractedFolder -Destination $mvnBinPath
        
        # Cleanup temp
        Remove-Item -Path $zipFile -Force
        Remove-Item -Path $tempExtract -Recurse -Force
        Write-Host "Apache Maven successfully installed locally!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error downloading Maven: $_" -ForegroundColor Red
        Write-Host "Please install Maven manually or run in Docker." -ForegroundColor Red
        Exit
    }
}

# 3. Start Backend in a new window
Write-Host "Launching Spring Boot Backend (Java)..." -ForegroundColor Cyan
$backendCommand = "cd backend; `$env:Path='$(Get-Location)\backend\maven-bin\bin;' + `$env:Path; `$env:GEMINI_API_KEY='$geminiKey'; `$env:MONGODB_URI='$mongoUri'; mvn spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# 4. Start Frontend in a new window
Write-Host "Launching React Frontend Dashboard (Node)..." -ForegroundColor Cyan
$frontendCommand = "cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   SmartReply Services Started Successfully!  " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "1. Frontend Web Dashboard: http://localhost:5173" -ForegroundColor Gray
Write-Host "2. Backend APIs: http://localhost:8080" -ForegroundColor Gray
Write-Host "3. Chrome Extension: Load the 'extension' folder at chrome://extensions/" -ForegroundColor Gray
Write-Host ""
Write-Host "Leave the opened PowerShell windows running. Press any key to exit this installer..." -ForegroundColor Yellow
Read-Host
