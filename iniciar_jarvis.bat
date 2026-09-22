@echo off
title J.A.R.V.I.S. Autonomous Cognitive System
cd /d "%~dp0"
echo ==============================================================================
echo [J.A.R.V.I.S.] INICIANDO SERVIDOR Y APLICACION DE ESCRITORIO
echo ==============================================================================
echo 1. Levantando servidor FastAPI / Uvicorn en segundo plano...
start /B python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
timeout /t 2 >nul

echo 2. Abriendo J.A.R.V.I.S. en modo Aplicacion de Escritorio (Standalone Window)...
start msedge.exe --app=http://127.0.0.1:8000 --window-size=1300,850

echo.
echo [OK] J.A.R.V.I.S. esta activo. Puedes minimizar esta ventana.
echo Para cerrarlo por completo ejecuta 'Cerrar_JARVIS.bat'.
pause
