from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import init_db
from app.routes import auth_router, debates_router, resources_router, notifications_router
from app.utils.logger import api_logger

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)


@app.on_event("startup")
async def startup_event():
    api_logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    api_logger.info("Initializing database connection")
    init_db()
    api_logger.info("Application startup complete")


@app.get("/")
async def root():
    api_logger.debug("Root endpoint accessed")
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "database": "PostgreSQL"
    }


@app.get("/health")
async def health_check():
    api_logger.debug("Health check endpoint accessed")
    return {
        "status": "healthy",
        "database": "PostgreSQL"
    }


app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(debates_router, prefix=settings.API_PREFIX)
app.include_router(resources_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
