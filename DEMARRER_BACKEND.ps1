# Script PowerShell pour démarrer le backend Spring Boot automatiquement
# Projet SADAKA - Utilise le wrapper Maven (mvnw)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE BACKEND SPRING BOOT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier du backend
$backendPath = "SadaqahApp_WEBServices-main"
if (-not (Test-Path $backendPath)) {
    Write-Host "✗ Dossier backend non trouve: $backendPath" -ForegroundColor Red
    Write-Host "Assurez-vous d'etre dans le dossier racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "Changement vers le dossier backend..." -ForegroundColor Yellow
Set-Location $backendPath

# Vérifier que mvnw existe
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "✗ mvnw.cmd non trouve !" -ForegroundColor Red
    Write-Host "Le wrapper Maven devrait etre present dans le projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Wrapper Maven trouve" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration detectee:" -ForegroundColor Cyan
Write-Host "  - Port: 6000" -ForegroundColor White
Write-Host "  - Base de donnees: geoinformatique" -ForegroundColor White
Write-Host "  - URL: http://localhost:6000" -ForegroundColor White
Write-Host ""
Write-Host "Compilation et demarrage du backend..." -ForegroundColor Yellow
Write-Host "Cela peut prendre 2-3 minutes la premiere fois (telechargement des dependances)..." -ForegroundColor Gray
Write-Host ""
Write-Host "Le backend va demarrer sur: http://localhost:6000" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - Assurez-vous que PostgreSQL est demarre" -ForegroundColor White
Write-Host "  - Assurez-vous que la base 'geoinformatique' existe" -ForegroundColor White
Write-Host "  - Appuyez sur Ctrl+C pour arreter le serveur" -ForegroundColor White
Write-Host ""
Write-Host "Demarrage en cours..." -ForegroundColor Green
Write-Host ""

# Démarrer le backend avec le wrapper Maven
try {
    .\mvnw.cmd spring-boot:run
} catch {
    Write-Host ""
    Write-Host "✗ Erreur lors du demarrage" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Verifier que PostgreSQL est demarre" -ForegroundColor White
    Write-Host "  2. Verifier les identifiants dans application.properties" -ForegroundColor White
    Write-Host "  3. Utiliser IntelliJ IDEA ou Eclipse pour demarrer le backend" -ForegroundColor White
    exit 1
}
