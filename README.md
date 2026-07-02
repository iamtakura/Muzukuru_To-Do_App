# Full-Stack To-Do/Auth Application (Muzukuru)

A highly premium and responsive task management web application built with a **FastAPI** backend (Python 3.8+) and a **React 18** (TypeScript) frontend served via **Vite**.

Authentication is handled securely via custom password hashing (using `bcrypt` via `passlib`) and JSON Web Tokens (`python-jose`) with client-side persistence and route guards.

---

## Project Structure

```text
/
├── backend/
│   ├── routes/
│   │   ├── auth_routes.py       # Registration and login endpoints
│   │   └── protected_routes.py  # Shared token verification and To-Do CRUD
│   ├── app.log                  # API log file (requests and exception traces)
│   ├── auth.py                  # Password hashing & JWT helper utilities
│   ├── database.py              # SQLite configuration and SQLAlchemy models
│   ├── logger.py                # Dual logger (console + app.log) setup
│   ├── main.py                  # App entrypoint, CORS setup, and logging middleware
│   ├── models.py                # Pydantic validation schemas
│   └── requirements.txt         # Pinned backend dependencies
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts        # Axios client with JWT request interceptor
    │   ├── components/
    │   │   └── Spinner.tsx      # Premium glassmorphic loading spinner
    │   ├── context/
    │   │   └── AuthContext.tsx  # Authentication context & localStorage token sync
    │   ├── pages/
    │   │   ├── Auth.css         # Styling for Register and Login pages
    │   │   ├── Login.tsx        # Login page with controlled validation
    │   │   ├── Register.tsx     # Register page with password validation
    │   │   ├── Protected.css    # Styling for Dashboard and Todo items
    │   │   └── Protected.tsx    # Protected To-Do list dashboard
    │   ├── types/
    │   │   └── index.ts         # Shared strict TypeScript interfaces
    │   ├── App.tsx              # React router, route guards, and layouts
    │   ├── index.css            # Base visual styling and scrolls
    │   └── main.tsx             # React entrypoint
    ├── .env                     # API base URL environment variable
    └── vite.config.ts           # Configured to host dev server on port 3000
```

---

## Setup & Running the Application

### 1. Backend Setup (FastAPI)

1. Open a terminal at the root workspace directory (`c:\Users\ssd\Documents\Projects\Muzukuru_To-Do_App`).

2. Launch the FastAPI server using the virtual environment's Uvicorn:
   ```powershell
   .\backend\venv\Scripts\uvicorn backend.main:app --reload --port 8000
   ```
   *(On macOS/Linux, run `./backend/venv/bin/uvicorn backend.main:app --reload --port 8000`)*

   The API will now be running at [http://localhost:8000](http://localhost:8000). You can visit the health check endpoint at [http://localhost:8000/health](http://localhost:8000/health).

---

### 2. Frontend Setup (React)

1. Open a separate terminal and navigate to the `/frontend` folder:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Launch the Vite development server:
   ```powershell
   npm run dev
   ```
   Vite will host the frontend application at [http://localhost:3000](http://localhost:3000).

---

## Design and Features

- **Dark Mode Aesthetics**: Deep purple and blue radial gradients with responsive grids.
- **Glassmorphism Form Cards**: Transparent backdrop filters and interactive glowing borders.
- **Authentication Route Guards**: Automatically redirects unauthenticated users away from `/protected` to `/login`, and redirects logged-in users away from `/login`/`/register` back to `/protected`.
- **JWT Header Interceptor**: Requests to the backend are auto-injected with the `Authorization: Bearer <token>` header if a token is present in the context.
- **Dual Destination Logging**: All API requests and internal exceptions are output to both the console terminal and a persistent file at `backend/app.log`.
