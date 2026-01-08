# Script simple pour tester si tout fonctionne
# À exécuter APRÈS que le backend soit démarré

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST RAPIDE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:6000"

# Test backend
Write-Host "Test 1: Backend ?" -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 5
    Write-Host "✅ OUI" -ForegroundColor Green
    $backendOk = $true
} catch {
    Write-Host "❌ NON - Le backend n'est pas démarré" -ForegroundColor Red
    Write-Host "   → Démarrer avec: .\DEMARRER_BACKEND.ps1" -ForegroundColor Gray
    $backendOk = $false
    exit 1
}

Write-Host ""

# Test catégories
Write-Host "Test 2: Catégories ?" -ForegroundColor Yellow
try {
    $cat = Invoke-WebRequest -Uri "$backendUrl/api/v1/categories" -Method GET -TimeoutSec 5
    $catJson = $cat.Content | ConvertFrom-Json
    if ($catJson -is [Array] -and $catJson.Count -gt 0) {
        Write-Host "✅ OUI - $($catJson.Count) catégories" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Tableau vide" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur" -ForegroundColor Red
}

Write-Host ""

# Test communes
Write-Host "Test 3: Communes ?" -ForegroundColor Yellow
try {
    $com = Invoke-WebRequest -Uri "$backendUrl/api/v1/communes" -Method GET -TimeoutSec 5
    $comJson = $com.Content | ConvertFrom-Json
    if ($comJson -is [Array] -and $comJson.Count -gt 0) {
        Write-Host "✅ OUI - $($comJson.Count) communes" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Tableau vide" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Si tout est OK:" -ForegroundColor Green
Write-Host "   → Rafraîchir le frontend (F5)" -ForegroundColor White
Write-Host "   → Les données devraient s'afficher !" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

