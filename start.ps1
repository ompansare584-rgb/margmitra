# Starts backend (port 8000) and frontend (port 5173) in two new windows.
# Run with:  powershell -ExecutionPolicy Bypass -File .\start.ps1
$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; & .\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm.cmd run dev"

Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"
