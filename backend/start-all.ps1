# Tüm servisleri başlatma scripti
# 1. ChromaDB server (Port 8000)
# 2. Node.js API server (Port 3001)

Write-Host "========================================" -ForegroundColor Green
Write-Host " Smart Price Tracker - Tüm Servisler" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# ChromaDB server başlat
Write-Host "[1/2] ChromaDB server başlatılıyor (Port 8000)..." -ForegroundColor Yellow
$env:CHROMA_SERVER_AUTHN_CREDENTIALS = ""
$env:CHROMA_SERVER_AUTHN_PROVIDER = ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "chroma run --path ./chroma_data --port 8000"

Start-Sleep -Seconds 3

# Node.js API server başlat
Write-Host "[2/2] Node.js API server başlatılıyor (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Tüm servisler başlatıldı!" -ForegroundColor Green
Write-Host "  ChromaDB : http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API      : http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "İlk çalıştırmada ürünleri indexlemek için:" -ForegroundColor Yellow
Write-Host "  node scripts/index-products.js" -ForegroundColor White
