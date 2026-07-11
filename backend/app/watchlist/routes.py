from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.auth.deps import get_current_user
from app.models.user import User
from app.watchlist import models, schemas

router = APIRouter(
    prefix="/api/watchlist",
    tags=["watchlist"]
)


@router.get("/", response_model=List[schemas.WatchlistResponse])
def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all stocks in the authenticated user's watchlist.
    Users can only see their own watchlist items.
    """
    return db.query(models.Watchlist).filter(
        models.Watchlist.user_id == current_user.id
    ).all()


@router.post("/", response_model=schemas.WatchlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item: schemas.WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Add a new stock to the authenticated user's watchlist.
    """
    # Prevent duplicate entries for the same user
    existing = db.query(models.Watchlist).filter(
        models.Watchlist.user_id == current_user.id,
        models.Watchlist.ticker == item.ticker.upper()
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{item.ticker.upper()} is already in your watchlist."
        )

    db_item = models.Watchlist(
        **item.model_dump(),
        user_id=current_user.id,
        ticker=item.ticker.upper()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    watchlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Remove a stock from the authenticated user's watchlist.
    Users can only delete their own watchlist items.
    """
    db_item = db.query(models.Watchlist).filter(
        models.Watchlist.id == watchlist_id,
        models.Watchlist.user_id == current_user.id
    ).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    db.delete(db_item)
    db.commit()
    return None
