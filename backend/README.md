# Account Assists API (FastAPI)

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## MongoDB (optional)

Set:

- `MONGODB_URI` (e.g. `mongodb://localhost:27017`)
- `MONGODB_DB` (default: `accountassists`)

If `MONGODB_URI` is not set (or MongoDB is unavailable), the API runs with in-memory storage.

## CORS

By default, CORS allows `http://localhost:3000`. Override with:

- `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

