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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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
