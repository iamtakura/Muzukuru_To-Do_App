import time
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.routes.auth_routes import router as auth_router
from backend.routes.protected_routes import router as protected_router
from backend.logger import logger

# Lifespan manager to handle startup operations
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI application...")
    try:
        init_db()
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}\n{traceback.format_exc()}")
        raise e
    yield
    logger.info("Shutting down FastAPI application...")

app = FastAPI(title="Todo Auth API", lifespan=lifespan)

# CORS configuration: Allow only http://localhost:3000 as requested
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom logging middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        # Log successful/client-error requests
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - {duration_ms:.2f}ms"
        )
        return response
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000
        tb_str = traceback.format_exc()
        # Log unhandled exceptions with full stack trace
        logger.error(
            f"EXCEPTION: {request.method} {request.url.path} - Failed in {duration_ms:.2f}ms - Error: {str(exc)}\n{tb_str}"
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )

# Include routers
app.include_router(auth_router)
app.include_router(protected_router)

# Root status route for sanity check
@app.get("/health")
def health_check():
    return {"status": "ok"}
