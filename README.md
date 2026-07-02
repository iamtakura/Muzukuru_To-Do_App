# Full-Stack To-Do/Auth Application (Muzukuru)

A task management web app with a FastAPI backend (Python 3.8+) and a React 18 (TypeScript) frontend served via Vite.

Authentication uses bcrypt password hashing (via passlib) and JWTs (via python-jose), with client-side token persistence and route guards.

## Project Structure

```
/
├── backend/
│   ├── routes/
│   │   ├── auth_routes.py       # Registration and login endpoints
│   │   └── protected_routes.py  # Token verification and To-Do CRUD
│   ├── auth.py                  # Password hashing & JWT utilities
│   ├── database.py              # SQLite config and SQLAlchemy models
│   ├── logger.py                # Console + app.log logger setup
│   ├── main.py                  # App entrypoint, CORS setup
│   ├── models.py                # Pydantic schemas
│   ├── requirements.txt         # Pinned backend dependencies
│   └── .env.example             # Template for required env vars
│
└── frontend/
    ├── src/
    │   ├── api/client.ts         # Axios client with JWT interceptor
    │   ├── components/Spinner.tsx
    │   ├── context/AuthContext.tsx
    │   ├── pages/                # Login, Register, Protected + CSS
    │   ├── types/index.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example              # Template for API base URL
    └── vite.config.ts            # Dev server on port 3000
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm

## 1. Backend Setup

From the **project root**:

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your local env file
copy .env.example .env      # Windows
cp .env.example .env        # macOS/Linux
```

Open `backend/.env` and set `SECRET_KEY` to a random string (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`).

Run the server **from the project root** (not from inside `/backend`):

```bash
cd ..
uvicorn backend.main:app --reload --port 8000
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## 2. Frontend Setup

In a separate terminal, from the project root:

```bash
cd frontend
cp .env.example .env   # copy the API URL template
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Verifying It Works

1. Register a new user at `/register`
2. You should be redirected to `/protected` with a working session
3. Refresh the page — session should persist
4. Sign out — should redirect to `/login` and block `/protected` access

## Design Notes

- Dark theme, glassmorphic form cards
- Route guards redirect unauthenticated users away from `/protected`, and authenticated users away from `/login` and `/register`
- JWT auto-attached via Axios interceptor on all requests
- All requests/errors logged to console and `backend/app.log`
