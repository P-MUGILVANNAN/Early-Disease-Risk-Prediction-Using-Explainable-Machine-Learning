"""
FastAPI Application Entrypoint
Early Disease Risk Prediction Using Explainable Machine Learning
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.database.session import init_db
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("disease_prediction_app")


# Initialize tables
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema
    logger.info("Database tables initialized.")
    yield
    # Shutdown
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Explainable Machine Learning platform for multi-disease risk prediction with local SHAP and Ollama integration.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def check_request_size_limit(request: Request, call_next):
    # 2MB maximum payload size limit
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 2 * 1024 * 1024:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Payload too large. Maximum permitted request body is 2MB."}
        )
    return await call_next(request)


# Mount API Router under /api
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {
        "title": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
