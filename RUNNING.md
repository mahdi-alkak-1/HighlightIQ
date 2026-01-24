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
## if there is error in node modules, delete and reinstall them

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

## remove any tracked node_modules (if added)
```powershell
git rm -r --cached highlight-client/node_modules
```

## Add these env var , n8n will not work without them
```powershell
$env:N8N_WEBHOOK_SECRET="2Dsqk1+HpqMXkMHjW564EP8RNmepb9UGnYpyudwHGN8="
$env:N8N_PUBLISH_WEBHOOK_URL="http://localhost:5679/webhook/youtube/publish"
go run .\cmd\api\main.go
```