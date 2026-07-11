import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database.database import engine, Base
from app.routes import auth, users
from app.dashboard import routes as dashboard_routes
from app.watchlist import routes as watchlist_routes

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinVise.AI API",
    description="AI-powered financial analysis platform API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") != "production" else None,
    redoc_url=None,
)

# Configure CORS — reads allowed origins from environment variable for production flexibility
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard_routes.router)
app.include_router(watchlist_routes.router)


@app.get("/", tags=["health"])
def read_root():
    return {"status": "ok", "message": "FinVise.AI API is running."}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
