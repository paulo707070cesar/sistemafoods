@echo off
chcp 65001 > nul
title Sistema Food — Gerador do Instalador Desktop (Windows .EXE)
color 06

echo ====================================================================
echo          SISTEMA FOOD — BAR E RESTAURANTE (VERSAO DESKTOP)
echo             GERADOR AUTOMATIZADO DO INSTALADOR WINDOWS (.EXE)
echo ====================================================================
echo.
echo [1/3] Verificando ambiente Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não foi encontrado no seu computador!
    echo Por favor, instale o Node.js v18 ou v20 em: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detectado!
echo.
echo [2/3] Instalando dependencias necessarias...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias com npm install.
    pause
    exit /b 1
)

echo.
echo [3/3] Compilando e gerando o Instalador Windows (Setup.exe)...
call npm run dist:win
if %errorlevel% neq 0 (
    echo [AVISO] Tentando gerar com pacote portatil...
    call npm run dist:portable
)

echo.
echo ====================================================================
echo [SUCESSO!] O Instalador do Sistema Food foi gerado com sucesso!
echo.
echo O arquivo instalador (.exe) esta localizado na pasta:
echo   --> dist-electron\
echo.
echo Abrindo a pasta do instalador agora...
echo ====================================================================
explorer dist-electron
pause
