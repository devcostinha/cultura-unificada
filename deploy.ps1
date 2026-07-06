$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CULTURA UNIFICADA - Deploy Automatico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectPath

if (-not (Test-Path ".git")) {
    Write-Host "[ERRO] Esta pasta nao e um repositorio Git." -ForegroundColor Red
    Write-Host "Coloque o DEPLOY.bat na raiz do projeto cultura-unificada." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/4] Verificando alteracoes..." -ForegroundColor Yellow
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host ""
    Write-Host "Nenhuma alteracao encontrada. O app ja esta atualizado!" -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Arquivos modificados:" -ForegroundColor White
git status --short
Write-Host ""

Write-Host "[2/4] Adicionando arquivos..." -ForegroundColor Yellow
git add .

$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"
$commitMsg = "deploy: atualizacao $timestamp"

Write-Host "[3/4] Commit: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

Write-Host "[4/4] Enviando para o GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   DEPLOY ENVIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Acompanhe o deploy em:" -ForegroundColor White
Write-Host "https://vercel.com/devcostinha/cultura-unificada" -ForegroundColor Cyan
Write-Host ""
Write-Host "App disponivel em:" -ForegroundColor White
Write-Host "https://cultura-unificada.vercel.app" -ForegroundColor Cyan
Write-Host ""
