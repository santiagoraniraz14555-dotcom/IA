@echo off
title Desconectar J.A.R.V.I.S.
echo Deteniendo procesos de J.A.R.V.I.S. en ejecucion...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
taskkill /F /IM uvicorn.exe >nul 2>&1
echo [OK] Todos los servicios de J.A.R.V.I.S. han sido desconectados limpiamente.
timeout /t 2 >nul
