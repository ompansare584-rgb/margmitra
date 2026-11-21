# MargMitra (मार्गमित्र)

A free, Marathi-first career-pathway web app for Maharashtra students, with an anonymised district skill-gap dashboard for officers.

Status: Phase 0 (skeleton). See STATE.md. Deploy steps: DEPLOY.md.

## Run locally (Windows PowerShell)

One time:
    powershell -ExecutionPolicy Bypass -File .\setup.ps1

Every time:
    powershell -ExecutionPolicy Bypass -File .\start.ps1

Opens http://localhost:5173 (frontend) and http://localhost:8000/health (backend).
