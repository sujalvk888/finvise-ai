from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from bson import ObjectId
from bson.errors import InvalidId
from typing import List

from app.database.database import get_db
from app.auth.deps import get_current_user
from app.watchlist import schemas
from app.watchlist.models import create_watchlist_doc, watchlist_doc_to_dict

router = APIRouter(
    prefix="/api/watchlist",
    tags=["watchlist"]
)


@router.get("/", response_model=List[schemas.WatchlistResponse])
def get_watchlist(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """
    Retrieve all stocks in the authenticated user's watchlist.
    Users can only see their own watchlist items.
    """
    docs = db.watchlists.find({"user_id": str(current_user["id"])})
    return [watchlist_doc_to_dict(doc) for doc in docs]


@router.post("/", response_model=schemas.WatchlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item: schemas.WatchlistCreate,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """
    Add a new stock to the authenticated user's watchlist.
    """
    ticker = item.ticker.upper()
    user_id = str(current_user["id"])

    # Prevent duplicate entries for the same user
    existing = db.watchlists.find_one({
        "user_id": user_id,
        "ticker": ticker
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{ticker} is already in your watchlist."
        )

    doc = create_watchlist_doc(
        user_id=user_id,
        ticker=ticker,
        company_name=item.company_name,
        logo_url=item.logo_url,
        sector=item.sector,
        current_price=item.current_price,
        market_cap=item.market_cap,
    )
    result = db.watchlists.insert_one(doc)
    doc["_id"] = result.inserted_id
    return watchlist_doc_to_dict(doc)


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    watchlist_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """
    Remove a stock from the authenticated user's watchlist.
    Users can only delete their own watchlist items.
    """
    user_id = str(current_user["id"])
    query = {"user_id": user_id}

    # Match by ObjectId if valid string, otherwise try matching as plain string
    try:
        query["_id"] = ObjectId(watchlist_id)
    except InvalidId:
        query["_id"] = watchlist_id

    doc = db.watchlists.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    db.watchlists.delete_one(query)
    return None
