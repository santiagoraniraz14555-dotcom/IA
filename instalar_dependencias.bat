@echo off
title Instalador de Dependencias de J.A.R.V.I.S.
echo ===================================================
echo     INSTALANDO DEPENDENCIAS DE J.A.R.V.I.S.
echo ===================================================
echo.

cd /d "%~dp0backend"

echo Asegurando gestor pip...
python -m ensurepip --default-pip

echo.
echo Actualizando pip...
python -m pip install --upgrade pip

echo.
echo Instalando dependencias de requirements.txt...
python -m pip install -r requirements.txt

echo.
echo ===================================================
echo     INSTALACION COMPLETADA
echo ===================================================
pause
