# ============================================
# SCRIPT DE DEMARRAGE COMPLET
# Backend (Spring Boot) + Frontend (React/Vite)
# ============================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE DU PROJET COMPLET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8081" -ForegroundColor Gray
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "SadaqahApp_WEBServices-main\pom.xml")) {
    Write-Host "ERREUR: Vous devez executer ce script depuis le repertoire racine du projet!" -ForegroundColor Red
    Write-Host "Repertoire actuel: $PWD" -ForegroundColor Gray
    exit 1
}

# Arrêter les processus existants (s'il y en a)
Write-Host "Nettoyage des processus existants..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" -or $_.Path -like "*java*" } | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    } catch {}
}
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmdLine -like "*vite*" -or $cmdLine -like "*frontend-web*") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}
Start-Sleep -Seconds 2

# ============================================
# ETAPE 1: DEMARRAGE DU BACKEND
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ETAPE 1: DEMARRAGE DU BACKEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$backendPath = "SadaqahApp_WEBServices-main"
Push-Location $backendPath

Write-Host "Compilation du backend..." -ForegroundColor Yellow
$compileResult = .\mvnw.cmd clean compile -DskipTests 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR DE COMPILATION!" -ForegroundColor Red
    Write-Host "Dernieres lignes de l'erreur:" -ForegroundColor Yellow
    $compileResult | Select-Object -Last 20 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Pop-Location
    exit 1
}

Write-Host "✅ Compilation reussie" -ForegroundColor Green
Write-Host ""
Write-Host "Demarrage du backend..." -ForegroundColor Yellow
Write-Host "  Port: 8081" -ForegroundColor Gray
Write-Host "  URL:  http://localhost:8081/api/v1/test" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Une nouvelle fenetre PowerShell va s'ouvrir pour le backend." -ForegroundColor Cyan
Write-Host "Ne fermez PAS cette fenetre!" -ForegroundColor Cyan
Write-Host ""

# Démarrer le backend dans une nouvelle fenêtre
$backendScript = @"
Write-Host '========================================' -ForegroundColor Green
Write-Host '   BACKEND - SPRING BOOT' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
Write-Host "Port: 8081" -ForegroundColor Yellow
Write-Host "Test: http://localhost:8081/api/v1/test" -ForegroundColor Gray
Write-Host ''
cd '$PWD'
.\mvnw.cmd spring-boot:run
pause
"@

$backendScriptPath = Join-Path $env:TEMP "start_backend.ps1"
$backendScript | Out-File -FilePath $backendScriptPath -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScriptPath`""

Pop-Location

# Attendre que le backend démarre
Write-Host ""
Write-Host "Attente du demarrage du backend (60 secondes)..." -ForegroundColor Yellow
$backendReady = $false
$maxWait = 60
$elapsed = 0

while (-not $backendReady -and $elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5
    $elapsed += 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/v1/test" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend demarre et repond!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "⚠️  Le backend n'a pas repondu dans les delais, mais on continue..." -ForegroundColor Yellow
    Write-Host "   Verifiez manuellement: http://localhost:8081/api/v1/test" -ForegroundColor Gray
}

# ============================================
# ETAPE 2: DEMARRAGE DU FRONTEND
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ETAPE 2: DEMARRAGE DU FRONTEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$frontendPath = "frontend-web"
Push-Location $frontendPath

# Vérifier que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors de l'installation des dependances!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "✅ Dependances installees" -ForegroundColor Green
}

Write-Host "Demarrage du frontend..." -ForegroundColor Yellow
Write-Host "  Port: 5173" -ForegroundColor Gray
Write-Host "  URL:  http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Une nouvelle fenetre PowerShell va s'ouvrir pour le frontend." -ForegroundColor Cyan
Write-Host "Ne fermez PAS cette fenetre!" -ForegroundColor Cyan
Write-Host ""

# Démarrer le frontend dans une nouvelle fenêtre
$frontendScript = @"
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '   FRONTEND - REACT/VITE' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host "Port: 5173" -ForegroundColor Yellow
Write-Host "URL:  http://localhost:5173" -ForegroundColor Gray
Write-Host ''
cd '$PWD'
npm run dev
pause
"@

$frontendScriptPath = Join-Path $env:TEMP "start_frontend.ps1"
$frontendScript | Out-File -FilePath $frontendScriptPath -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScriptPath`""

Pop-Location

# ============================================
# RECAPITULATIF
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   DEMARRAGE TERMINE!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Deux fenetres PowerShell ont ete ouverte:" -ForegroundColor Yellow
Write-Host "  1. Backend (Spring Boot) - Port 8081" -ForegroundColor Green
Write-Host "  2. Frontend (React/Vite) - Port 5173" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8081/api/v1/test" -ForegroundColor White
Write-Host ""
Write-Host "ATTENTION:" -ForegroundColor Red
Write-Host "  - Ne fermez PAS les fenetres PowerShell du backend et frontend" -ForegroundColor Yellow
Write-Host "  - Pour arreter: fermez les fenetres PowerShell OU appuyez sur Ctrl+C dans chacune" -ForegroundColor Yellow
Write-Host ""
Write-Host "Attendez 30-60 secondes pour que tout soit pret, puis ouvrez:" -ForegroundColor Cyan
Write-Host "  http://localhost:5173" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
