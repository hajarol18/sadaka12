# Script pour tester le mot de passe PostgreSQL
# Projet SADAKA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST DU MOT DE PASSE POSTGRESQL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Essayer de se connecter avec différents mots de passe
$passwords = @("hajar", "0000", "postgres", "admin", "root")

Write-Host "Test de connexion avec différents mots de passe..." -ForegroundColor Yellow
Write-Host ""

foreach ($pwd in $passwords) {
    Write-Host "Test avec le mot de passe: '$pwd'" -ForegroundColor Cyan
    
    try {
        # Utiliser psql si disponible, sinon essayer une connexion JDBC via Java
        $env:PGPASSWORD = $pwd
        $result = & psql -U postgres -d geoinformatique -c "SELECT 1;" 2>&1
        
        if ($LASTEXITCODE -eq 0 -or $result -notmatch "password authentication failed") {
            Write-Host "✅✅✅ MOT DE PASSE TROUVÉ: '$pwd' ✅✅✅" -ForegroundColor Green
            Write-Host ""
            Write-Host "Je vais corriger application.properties maintenant..." -ForegroundColor Yellow
            break
        } else {
            Write-Host "❌ Incorrect" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   COMMENT VERIFIER DANS PGADMIN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Dans pgAdmin, clic droit sur 'PostgreSQL 16'" -ForegroundColor White
Write-Host "2. Sélectionnez 'Properties' ou 'Propriétés'" -ForegroundColor White
Write-Host "3. Regardez l'onglet 'Connection' ou 'Connexion'" -ForegroundColor White
Write-Host "4. Le mot de passe devrait être visible (ou demandé)" -ForegroundColor White
Write-Host ""
Write-Host "OU" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Essayez de vous reconnecter à PostgreSQL 16" -ForegroundColor White
Write-Host "2. Utilisez le mot de passe que vous tapez habituellement" -ForegroundColor White
Write-Host "3. C'est ce mot de passe qu'il faut mettre dans application.properties" -ForegroundColor White
Write-Host ""

