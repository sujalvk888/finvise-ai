from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from app.database.database import Base

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ticker = Column(String, index=True, nullable=False)
    company_name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    current_price = Column(Float, nullable=True)
    market_cap = Column(String, nullable=True)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

