# Wakes the free backend before a demo. Usage:
#   .\scripts\wake.ps1 -Url https://margmitra-api.onrender.com
param([Parameter(Mandatory = $true)][string]$Url)
$Url = $Url.TrimEnd('/')
Write-Host "Waking $Url ... (the first answer can take up to a minute)"
for ($i = 1; $i -le 20; $i++) {
  try {
    $r = Invoke-RestMethod -Uri "$Url/health" -TimeoutSec 30
    if ($r.status -eq "ok") { Write-Host "AWAKE after $i try(ies). Backend is ready." -ForegroundColor Green; exit 0 }
  } catch {
    Write-Host "try $i : not ready yet ($($_.Exception.Message))"
  }
  Start-Sleep -Seconds 5
}
Write-Host "Still not answering. Check the Render dashboard logs." -ForegroundColor Red
exit 1
