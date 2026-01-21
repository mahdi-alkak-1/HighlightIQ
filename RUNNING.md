# Running HighlightIQ (local)

Run these commands from the repo root: `C:\Users\mahdi\OneDrive\Desktop\HighlightIQ`.

## Backend API (Go)

```powershell
cd highlight-server
go run .\cmd\api\main.go
```

## Clipper service (Python)

```powershell
cd highlight-server
.\clipper\.venv\Scripts\Activate.ps1
python -m uvicorn clipper.clipper_service:app --host 127.0.0.1 --port 8090 --reload
```

## Frontend (Vite)

```powershell
cd highlight-client
npm install
npm run dev
```
