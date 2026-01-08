# Script PowerShell pour tester les endpoints backend
# Projet SADAKA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST DES ENDPOINTS BACKEND" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:6000"

# Test 1: Backend accessible ?
Write-Host "Test 1: Vérification du backend..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 3
    Write-Host "✅ Backend accessible sur $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NON accessible !" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "  1. Démarrer le backend:" -ForegroundColor White
    Write-Host "     .\DEMARRER_BACKEND.ps1" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""

# Test 2: Catégories
Write-Host "Test 2: Endpoint /api/v1/categories" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/v1/categories" -Method GET -TimeoutSec 5
    $content = $response.Content
    
    Write-Host "✅ Endpoint accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Taille réponse: $($content.Length) caractères" -ForegroundColor Gray
    
    # Essayer de parser le JSON
    try {
        $json = $content | ConvertFrom-Json
        if ($json -is [Array]) {
            Write-Host "   ✅ Format: Tableau avec $($json.Count) éléments" -ForegroundColor Green
            if ($json.Count -gt 0) {
                Write-Host "   Premier élément: $($json[0] | ConvertTo-Json -Compress)" -ForegroundColor Gray
            } else {
                Write-Host "   ⚠️ Tableau vide - Aucune catégorie dans PostgreSQL" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ⚠️ Format: Objet (pas un tableau)" -ForegroundColor Yellow
            Write-Host "   Contenu: $($content.Substring(0, [Math]::Min(200, $content.Length)))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️ Impossible de parser le JSON" -ForegroundColor Yellow
        Write-Host "   Contenu brut: $($content.Substring(0, [Math]::Min(200, $content.Length)))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Communes
Write-Host "Test 3: Endpoint /api/v1/communes" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/v1/communes" -Method GET -TimeoutSec 5
    $content = $response.Content
    
    Write-Host "✅ Endpoint accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Taille réponse: $($content.Length) caractères" -ForegroundColor Gray
    
    # Essayer de parser le JSON
    try {
        $json = $content | ConvertFrom-Json
        if ($json -is [Array]) {
            Write-Host "   ✅ Format: Tableau avec $($json.Count) éléments" -ForegroundColor Green
            if ($json.Count -gt 0) {
                Write-Host "   Premier élément: $($json[0] | ConvertTo-Json -Compress)" -ForegroundColor Gray
            } else {
                Write-Host "   ⚠️ Tableau vide - Aucune commune dans PostgreSQL" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "   SOLUTION:" -ForegroundColor Yellow
                Write-Host "     Exécuter dans pgAdmin:" -ForegroundColor White
                Write-Host "     \i frontend-web\insert_communes_complet.sql" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ⚠️ Format: Objet (pas un tableau)" -ForegroundColor Yellow
            Write-Host "   Contenu: $($content.Substring(0, [Math]::Min(200, $content.Length)))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️ Impossible de parser le JSON" -ForegroundColor Yellow
        Write-Host "   Contenu brut: $($content.Substring(0, [Math]::Min(200, $content.Length)))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

