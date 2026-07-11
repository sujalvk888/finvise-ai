from pydantic import BaseModel
from typing import Optional
from typing import Optional, List


class StockRequest(BaseModel):
    ticker: str


class AiReportRequest(BaseModel):
    ticker: str
    engine: str = "groq"  # 'groq' or 'ollama'


class AiReportResponse(BaseModel):
    engine: str
    company_summary: str
    strengths: List[str]
    risks: List[str]
    verdict_label: str
    verdict_text: str


class HistoricalDataPoint(BaseModel):
    date: str
    close: float


class HistoricalDataResponse(BaseModel):
    ticker: str
    time_range: str
    data: List[HistoricalDataPoint]


class StockDataResponse(BaseModel):
    # Company Identity
    company_name: Optional[str] = None
    symbol: str
    currency: str = "INR"  # Hardcoded to INR since we convert everything
    exchange: Optional[str] = None
    industry: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    business_summary: Optional[str] = None
    logo_url: Optional[str] = None  # New field
    last_updated_time: Optional[str] = None  # New field

    # Pricing (All values in INR)
    current_price: Optional[float] = None
    previous_close: Optional[float] = None
    open_price: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    market_state: Optional[str] = None

    # 52-week (All values in INR)
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None

    # Fundamentals (Monetary values in INR)
    market_cap: Optional[float] = None
    volume: Optional[int] = None
    average_volume: Optional[float] = None
    dividend_yield: Optional[float] = None
    beta: Optional[float] = None
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    debt_to_equity: Optional[float] = None  # New field
    gross_margin: Optional[float] = None    # New field
    validation_flags: Optional[dict] = None # Added for metrics validation

class ErrorResponse(BaseModel):
    detail: str
