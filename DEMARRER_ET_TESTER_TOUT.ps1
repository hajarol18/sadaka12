# Script complet : Démarrer le backend, attendre, tester, et vérifier
# Projet SADAKA

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEMARRAGE ET TEST COMPLET" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://localhost:6000"

# Étape 1: Vérifier si le backend est déjà démarré
Write-Host "Étape 1: Vérification du backend..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend déjà démarré !" -ForegroundColor Green
    Write-Host ""
    $backendRunning = $true
} catch {
    Write-Host "⏳ Backend non démarré, démarrage en cours..." -ForegroundColor Yellow
    Write-Host ""
    $backendRunning = $false
    
    # Démarrer le backend dans une nouvelle fenêtre
    $backendPath = "SadaqahApp_WEBServices-main"
    if (Test-Path $backendPath) {
        Write-Host "Démarrage du backend dans une nouvelle fenêtre..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\$backendPath'; Write-Host '========================================' -ForegroundColor Green; Write-Host '   BACKEND SPRING BOOT' -ForegroundColor Green; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; Write-Host 'Démarrage en cours...' -ForegroundColor Yellow; Write-Host 'Attendez 2-3 minutes...' -ForegroundColor Gray; Write-Host ''; if (Test-Path 'mvnw.cmd') { .\mvnw.cmd spring-boot:run } else { Write-Host 'ERREUR: mvnw.cmd non trouvé' -ForegroundColor Red }" -WindowStyle Normal
        Write-Host "✅ Backend en cours de démarrage..." -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Dossier backend non trouvé: $backendPath" -ForegroundColor Red
        exit 1
    }
}

# Étape 2: Attendre que le backend soit prêt
if (-not $backendRunning) {
    Write-Host "Étape 2: Attente du démarrage du backend..." -ForegroundColor Yellow
    Write-Host "Vérification toutes les 10 secondes (max 3 minutes)..." -ForegroundColor Gray
    Write-Host ""
    
    $maxAttempts = 18  # 18 x 10 secondes = 3 minutes
    $attempt = 0
    $success = $false
    
    while ($attempt -lt $maxAttempts -and -not $success) {
        $attempt++
        Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Cyan
        
        try {
            $test = Invoke-WebRequest -Uri "$backendUrl/api/v1/utilisateurs" -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host ""
            Write-Host "✅✅✅ BACKEND ACCESSIBLE ! ✅✅✅" -ForegroundColor Green
            Write-Host ""
            $success = $true
        } catch {
            if ($attempt -lt $maxAttempts) {
                Write-Host "⏳ Pas encore prêt, attente 10 secondes..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
    }
    
    if (-not $success) {
        Write-Host ""
        Write-Host "❌ Backend non accessible après 3 minutes" -ForegroundColor Red
        Write-Host ""
        Write-Host "Vérifications:" -ForegroundColor Yellow
        Write-Host "  1. Regardez la fenêtre PowerShell du backend" -ForegroundColor White
        Write-Host "  2. Y a-t-il des erreurs ?" -ForegroundColor White
        Write-Host "  3. PostgreSQL est-il démarré ?" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# Étape 3: Tester les endpoints
Write-Host "Étape 3: Test des endpoints..." -ForegroundColor Yellow
Write-Host ""

# Test catégories
Write-Host "Test des catégories..." -ForegroundColor Cyan
try {
    $cat = Invoke-WebRequest -Uri "$backendUrl/api/v1/categories" -Method GET -TimeoutSec 5
    $catJson = $cat.Content | ConvertFrom-Json
    
    if ($catJson -is [Array]) {
        if ($catJson.Count -gt 0) {
            Write-Host "✅ Catégories: $($catJson.Count) trouvées" -ForegroundColor Green
            Write-Host "   Exemples:" -ForegroundColor Gray
            for ($i = 0; $i -lt [Math]::Min(3, $catJson.Count); $i++) {
                Write-Host "     - $($catJson[$i].nom)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️ Catégories: Tableau vide" -ForegroundColor Yellow
            Write-Host "   → Vérifier les données dans PostgreSQL" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Catégories: Format inattendu" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur catégories: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test communes
Write-Host "Test des communes..." -ForegroundColor Cyan
try {
    $com = Invoke-WebRequest -Uri "$backendUrl/api/v1/communes" -Method GET -TimeoutSec 5
    $comJson = $com.Content | ConvertFrom-Json
    
    if ($comJson -is [Array]) {
        if ($comJson.Count -gt 0) {
            Write-Host "✅ Communes: $($comJson.Count) trouvées" -ForegroundColor Green
            Write-Host "   Exemples:" -ForegroundColor Gray
            for ($i = 0; $i -lt [Math]::Min(3, $comJson.Count); $i++) {
                Write-Host "     - $($comJson[$i].nomCommune)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️ Communes: Tableau vide" -ForegroundColor Yellow
            Write-Host "   → Exécuter insert_communes_complet.sql dans pgAdmin" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Communes: Format inattendu" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur communes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Étape 4: Résumé final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ✅✅✅ TOUT EST PRÊT ! ✅✅✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ouvrir le navigateur:" -ForegroundColor White
Write-Host "   http://localhost:5173/map" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Rafraîchir la page (F5)" -ForegroundColor White
Write-Host ""
Write-Host "3. Ouvrir la console (F12) pour voir les logs" -ForegroundColor White
Write-Host ""
Write-Host "4. Les catégories et communes devraient s'afficher !" -ForegroundColor Green
Write-Host ""
Write-Host "Si 'No Data' persiste:" -ForegroundColor Yellow
Write-Host "  - Vérifier la console (F12) pour les erreurs" -ForegroundColor White
Write-Host "  - Regarder les logs [getCategories] et [getCommunes]" -ForegroundColor White
Write-Host ""

