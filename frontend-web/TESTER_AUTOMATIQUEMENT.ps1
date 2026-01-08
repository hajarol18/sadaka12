# Script pour tester automatiquement les endpoints après démarrage du backend
# Projet SADAKA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST AUTOMATIQUE DES ENDPOINTS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:6000"
$maxAttempts = 20  # 20 tentatives = ~3 minutes max
$attempt = 0
$success = $false

Write-Host "Attente du démarrage du backend..." -ForegroundColor Yellow
Write-Host "Vérification toutes les 10 secondes..." -ForegroundColor Gray
Write-Host ""

while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Cyan
    
    try {
        # Test 1: Backend accessible
        $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host ""
        Write-Host "✅✅✅ BACKEND ACCESSIBLE ! ✅✅✅" -ForegroundColor Green
        Write-Host ""
        
        # Test 2: Catégories
        Write-Host "Test des catégories..." -ForegroundColor Yellow
        try {
            $cat = Invoke-WebRequest -Uri "$backendUrl/api/v1/categories" -Method GET -TimeoutSec 5
            $catJson = $cat.Content | ConvertFrom-Json
            
            if ($catJson -is [Array]) {
                if ($catJson.Count -gt 0) {
                    Write-Host "✅ Catégories: $($catJson.Count) trouvées" -ForegroundColor Green
                    Write-Host "   Première: $($catJson[0].nom)" -ForegroundColor Gray
                } else {
                    Write-Host "⚠️ Catégories: Tableau vide" -ForegroundColor Yellow
                }
            } else {
                Write-Host "⚠️ Catégories: Format inattendu" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Erreur catégories: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        
        # Test 3: Communes
        Write-Host "Test des communes..." -ForegroundColor Yellow
        try {
            $com = Invoke-WebRequest -Uri "$backendUrl/api/v1/communes" -Method GET -TimeoutSec 5
            $comJson = $com.Content | ConvertFrom-Json
            
            if ($comJson -is [Array]) {
                if ($comJson.Count -gt 0) {
                    Write-Host "✅ Communes: $($comJson.Count) trouvées" -ForegroundColor Green
                    Write-Host "   Première: $($comJson[0].nomCommune)" -ForegroundColor Gray
                } else {
                    Write-Host "⚠️ Communes: Tableau vide" -ForegroundColor Yellow
                    Write-Host ""
                    Write-Host "   SOLUTION:" -ForegroundColor Yellow
                    Write-Host "     Exécuter dans pgAdmin:" -ForegroundColor White
                    Write-Host "     File → Open → insert_communes_complet.sql" -ForegroundColor Gray
                    Write-Host "     Puis F5 pour exécuter" -ForegroundColor Gray
                }
            } else {
                Write-Host "⚠️ Communes: Format inattendu" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Erreur communes: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅✅✅ TOUT FONCTIONNE ! ✅✅✅" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
        Write-Host "  1. Rafraîchir le frontend (F5)" -ForegroundColor White
        Write-Host "  2. Ouvrir la console (F12) pour voir les logs" -ForegroundColor White
        Write-Host "  3. Les catégories et communes devraient s'afficher" -ForegroundColor White
        Write-Host ""
        
        $success = $true
        
    } catch {
        if ($attempt -lt $maxAttempts) {
            Write-Host "⏳ Backend pas encore prêt, attente 10 secondes..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "❌ Backend non accessible après $maxAttempts tentatives" -ForegroundColor Red
    Write-Host ""
    Write-Host "VÉRIFICATIONS:" -ForegroundColor Yellow
    Write-Host "  1. Le backend est-il démarré dans une autre fenêtre ?" -ForegroundColor White
    Write-Host "  2. Y a-t-il des erreurs dans les logs du backend ?" -ForegroundColor White
    Write-Host "  3. PostgreSQL est-il démarré ?" -ForegroundColor White
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "  Démarrer le backend manuellement:" -ForegroundColor White
    Write-Host "  .\DEMARRER_BACKEND.ps1" -ForegroundColor Gray
    Write-Host ""
}

