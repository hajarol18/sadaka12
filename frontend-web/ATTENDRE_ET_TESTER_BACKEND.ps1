# Script pour attendre le démarrage du backend et tester les endpoints
# Projet SADAKA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ATTENTE ET TEST DU BACKEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:6000"
$maxAttempts = 12  # 12 tentatives = 2 minutes max
$attempt = 0

Write-Host "Attente du démarrage du backend..." -ForegroundColor Yellow
Write-Host "Vérification toutes les 10 secondes..." -ForegroundColor Gray
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Cyan
    
    try {
        $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host ""
        Write-Host "✅✅✅ BACKEND ACCESSIBLE ! ✅✅✅" -ForegroundColor Green
        Write-Host ""
        
        # Test catégories
        Write-Host "Test des catégories..." -ForegroundColor Yellow
        try {
            $cat = Invoke-WebRequest -Uri "$backendUrl/api/v1/categories" -Method GET -TimeoutSec 5
            $catJson = $cat.Content | ConvertFrom-Json
            if ($catJson -is [Array]) {
                Write-Host "✅ Catégories: $($catJson.Count) trouvées" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Catégories: Format inattendu" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Erreur catégories: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test communes
        Write-Host "Test des communes..." -ForegroundColor Yellow
        try {
            $com = Invoke-WebRequest -Uri "$backendUrl/api/v1/communes" -Method GET -TimeoutSec 5
            $comJson = $com.Content | ConvertFrom-Json
            if ($comJson -is [Array]) {
                Write-Host "✅ Communes: $($comJson.Count) trouvées" -ForegroundColor Green
                if ($comJson.Count -eq 0) {
                    Write-Host ""
                    Write-Host "⚠️ Aucune commune dans PostgreSQL !" -ForegroundColor Yellow
                    Write-Host "   Exécuter: insert_communes_complet.sql dans pgAdmin" -ForegroundColor White
                }
            } else {
                Write-Host "⚠️ Communes: Format inattendu" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Erreur communes: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "✅ Le backend fonctionne !" -ForegroundColor Green
        Write-Host "   Vous pouvez maintenant rafraîchir la page frontend" -ForegroundColor White
        Write-Host ""
        exit 0
        
    } catch {
        if ($attempt -lt $maxAttempts) {
            Write-Host "⏳ Backend pas encore prêt, attente 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

Write-Host ""
Write-Host "❌ Backend non accessible après $maxAttempts tentatives" -ForegroundColor Red
Write-Host ""
Write-Host "Vérifications:" -ForegroundColor Yellow
Write-Host "  1. Le backend est-il en train de démarrer dans un autre terminal ?" -ForegroundColor White
Write-Host "  2. Y a-t-il des erreurs dans les logs du backend ?" -ForegroundColor White
Write-Host "  3. PostgreSQL est-il démarré ?" -ForegroundColor White
Write-Host ""
exit 1

