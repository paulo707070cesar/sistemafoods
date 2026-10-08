@echo off
chcp 65001 > nul
title Sistema Food — Iniciar Servidor Local / Desktop
color 0A

echo ====================================================================
echo         SISTEMA FOOD — INICIANDO APLICACAO LOCALMENTE
echo ====================================================================
echo.

if not exist "node_modules\" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias...
    call npm install
)

echo [INFO] Iniciando sistema na porta 3000...
echo O sistema abrira em: http://localhost:3000
echo.
call npm run dev
pause
