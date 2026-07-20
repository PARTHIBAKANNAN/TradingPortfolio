# 🚀 How to Run TradePortfolio

## Terminal 1: Frontend Dev Server (Already Running)
```bash
npm run dev
# Runs on http://localhost:5173
```

## Terminal 2: Backend API Server (REQUIRED)
```bash
npm run sync:dev
# Runs Cloudflare Workers on http://127.0.0.1:8788
# This serves the API endpoints
```

## What Each Does:
- **Frontend** (`npm run dev`): React UI with premium dashboard
- **Backend** (`npm run sync:dev`): Wrangler dev server for API endpoints

## Access the App:
1. Make sure **both** terminals are running
2. Open: `http://localhost:5173`
3. The frontend will automatically connect to the API on port 8788

## If You See "JSON Parsing Error":
This means the backend is not running. Start it in a new terminal with:
```bash
npm run sync:dev
```

## Quick Start (Copy/Paste):
Terminal 1:
```bash
npm run dev
```

Terminal 2 (new terminal in same directory):
```bash
npm run sync:dev
```

---

**Status Check:**
- Frontend: `curl http://localhost:5173` ✅ (should return HTML)
- Backend: `curl http://127.0.0.1:8788` ✅ (should respond after starting)
