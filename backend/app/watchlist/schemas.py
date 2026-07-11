from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WatchlistBase(BaseModel):
    ticker: str
    company_name: str
    logo_url: Optional[str] = None
    sector: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    id: int
    added_at: datetime

    class Config:
        from_attributes = True
