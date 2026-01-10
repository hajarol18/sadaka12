# Script PowerShell pour redémarrer le backend Spring Boot
# Version URGENTE - Fenêtre visible pour voir les erreurs

Write-Host "========================================" -ForegroundColor Red
Write-Host "   REDEMARRAGE URGENT DU BACKEND" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Aller dans le dossier du backend
$backendPath = "SadaqahApp_WEBServices-main"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Dossier backend non trouvé: $backendPath" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le dossier racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "Changement vers le dossier backend..." -ForegroundColor Yellow
Set-Location $backendPath

# Vérifier que mvnw existe
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "❌ mvnw.cmd non trouvé !" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Wrapper Maven trouvé" -ForegroundColor Green
Write-Host ""

# Arrêter les processus Java existants
Write-Host "Arrêt des processus Java existants..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { 
    $_.Path -like "*java*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Processus arrêtés" -ForegroundColor Green
Write-Host ""

# Compiler d'abord
Write-Host "Compilation du backend..." -ForegroundColor Cyan
.\mvnw.cmd clean compile -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de compilation!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compilation réussie" -ForegroundColor Green
Write-Host ""

# Démarrer le backend dans une nouvelle fenêtre
Write-Host "Démarrage du backend dans une nouvelle fenêtre..." -ForegroundColor Cyan
Write-Host "Vous verrez les logs dans la nouvelle fenêtre PowerShell" -ForegroundColor Yellow
Write-Host ""

$scriptPath = Join-Path $PWD "mvnw.cmd"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '========================================' -ForegroundColor Green; Write-Host '   BACKEND SPRING BOOT' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; Write-Host 'Démarrage en cours...' -ForegroundColor Cyan; Write-Host 'Attendez le message: Started SadaqahApplication' -ForegroundColor Yellow; Write-Host ''; .\mvnw.cmd spring-boot:run"

Write-Host "✅ Backend démarré dans une nouvelle fenêtre" -ForegroundColor Green
Write-Host ""
Write-Host "Attendez 30-60 secondes que le backend démarre..." -ForegroundColor Yellow
Write-Host "Vous verrez 'Started SadaqahApplication' dans la nouvelle fenêtre" -ForegroundColor Yellow
Write-Host ""
Write-Host "Puis testez dans le navigateur:" -ForegroundColor Cyan
Write-Host "  http://localhost:8081/api/v1/categories" -ForegroundColor Gray
Write-Host "  http://localhost:8081/api/v1/communes" -ForegroundColor Gray
Write-Host "  http://localhost:8081/api/v1/annonces" -ForegroundColor Gray
Write-Host ""

