# ChromaDB server başlatma scripti
# Port: 8000, Veri dizini: ./chroma_data

Write-Host "ChromaDB server başlatılıyor..." -ForegroundColor Green
Write-Host "Port: 8000" -ForegroundColor Cyan
Write-Host "Veri dizini: ./chroma_data" -ForegroundColor Cyan
Write-Host ""

$env:CHROMA_SERVER_AUTHN_CREDENTIALS = ""
$env:CHROMA_SERVER_AUTHN_PROVIDER = ""

chroma run --path ./chroma_data --port 8000
