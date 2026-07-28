from datetime import datetime, timezone
from typing import Optional, Dict, Any


def watchlist_doc_to_dict(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Convert a raw MongoDB watchlist document to a clean Python dictionary with string 'id'.
    """
    if not doc:
        return None

    return {
        "id": str(doc["_id"]),
        "user_id": str(doc.get("user_id", "")),
        "ticker": doc.get("ticker", ""),
        "company_name": doc.get("company_name", ""),
        "logo_url": doc.get("logo_url"),
        "sector": doc.get("sector"),
        "current_price": doc.get("current_price"),
        "market_cap": doc.get("market_cap"),
        "added_at": doc.get("added_at", datetime.now(timezone.utc)),
    }


def create_watchlist_doc(
    user_id: str,
    ticker: str,
    company_name: str,
    logo_url: Optional[str] = None,
    sector: Optional[str] = None,
    current_price: Optional[float] = None,
    market_cap: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a new MongoDB watchlist document dictionary.
    """
    return {
        "user_id": str(user_id),
        "ticker": ticker.upper(),
        "company_name": company_name,
        "logo_url": logo_url,
        "sector": sector,
        "current_price": current_price,
        "market_cap": market_cap,
        "added_at": datetime.now(timezone.utc),
    }
