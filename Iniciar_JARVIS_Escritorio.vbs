Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtener ruta absoluta del directorio del proyecto
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' 1. Iniciar servidor FastAPI en segundo plano de forma 100% invisible (sin ventana CMD)
WshShell.Run "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000", 0, False

' 2. Esperar 1.8 segundos a que el servidor enlace el puerto local
WScript.Sleep 1800

' 3. Lanzar J.A.R.V.I.S. en modo ventana de escritorio nativa (Edge App Mode / PWA)
edgeCmd = "msedge.exe --app=http://127.0.0.1:8000 --window-size=1300,850 --user-data-dir=""" & scriptDir & "\uploads\desktop_profile"""

On Error Resume Next
WshShell.Run edgeCmd, 1, False

If Err.Number <> 0 Then
    ' Fallback al navegador predeterminado del sistema si Edge no está en PATH
    WshShell.Run "http://127.0.0.1:8000", 1, False
End If
