from datetime import datetime, timezone
from typing import Optional, Dict, Any


def user_doc_to_dict(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Convert a raw MongoDB user document to a clean Python dictionary with string 'id'.
    """
    if not doc:
        return None

    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "hashed_password": doc.get("hashed_password"),
        "auth_provider": doc.get("auth_provider", "local"),
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc)),
    }


def create_user_doc(
    email: str,
    name: str,
    hashed_password: Optional[str] = None,
    auth_provider: str = "local",
) -> Dict[str, Any]:
    """
    Create a new MongoDB user document dictionary.
    """
    now = datetime.now(timezone.utc)
    return {
        "email": email,
        "name": name,
        "hashed_password": hashed_password,
        "auth_provider": auth_provider,
        "created_at": now,
        "updated_at": now,
    }
