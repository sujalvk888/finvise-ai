import os
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection Configuration
# Support MONGODB_URL or fallback to DATABASE_URL only if it is a valid MongoDB URI, otherwise default to local
_uri = os.getenv("MONGODB_URL")
if not _uri:
    _db_url = os.getenv("DATABASE_URL", "")
    if _db_url.startswith("mongodb://") or _db_url.startswith("mongodb+srv://"):
        _uri = _db_url
    else:
        _uri = "mongodb://localhost:27017"

MONGODB_URL = _uri
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "finvise_db")

# Lazy MongoClient initialization so imports are instant
_client = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(
            MONGODB_URL,
            tz_aware=True,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
    return _client


def get_db_instance():
    return get_client()[MONGODB_DB_NAME]


def get_db():
    """
    FastAPI dependency that yields the MongoDB database instance.
    """
    try:
        yield get_db_instance()
    except PyMongoError as e:
        raise


def init_indexes():
    """
    Initialize MongoDB collection indexes for uniqueness and query performance.
    """
    try:
        db = get_db_instance()
        # Unique index on user email
        db.users.create_index("email", unique=True)
        # Compound unique index on user_id and ticker for watchlists
        db.watchlists.create_index([("user_id", 1), ("ticker", 1)], unique=True)
        db.watchlists.create_index("user_id")
    except Exception as e:
        print(f"Warning: Could not initialize MongoDB indexes: {e}")
