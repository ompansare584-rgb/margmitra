# One-time setup: installs backend and frontend packages.
# Run with:  powershell -ExecutionPolicy Bypass -File .\setup.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Setting up backend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Setting up frontend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm.cmd install

Set-Location $PSScriptRoot
Write-Host "Done. Now run:  powershell -ExecutionPolicy Bypass -File .\start.ps1" -ForegroundColor Green
