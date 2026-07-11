"""
Dashboard services — Finnhub data retrieval and processing.
Business logic lives here; routes stay thin.
"""

import os
import logging
import finnhub
import yfinance as yf
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException
import requests
from app.dashboard.currency import convert_to_inr
from app.dashboard.validators import validate_stock_data

logger = logging.getLogger(__name__)

# Initialize Finnhub client
finnhub_client = finnhub.Client(api_key=os.getenv('FINNHUB_API_KEY'))

def _safe_float(val):
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def get_historical_data(ticker: str, time_range: str) -> Dict[str, Any]:
    """
    Fetch historical stock data using yfinance and process with pandas.
    time_range must be one of: '1M', '3M', '6M', '1Y', '5Y', 'MAX'
    """
    range_mapping = {
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y",
        "5Y": "5y",
        "MAX": "max"
    }
    
    period = range_mapping.get(time_range.upper(), "1y")
    
    try:
        ticker_obj = yf.Ticker(ticker)
        df = ticker_obj.history(period=period)
        
        if df.empty:
            return {"ticker": ticker, "time_range": time_range, "data": []}
            
        # Clean data with pandas
        df = df.dropna(subset=["Close"])
        df = df.sort_index()
        
        data_points = []
        for date, row in df.iterrows():
            # date is a pandas Timestamp
            # Format to short month/year e.g. "Dec 12, 2024" or standard YYYY-MM-DD
            # Recharts can handle standard strings well. Let's use YYYY-MM-DD for consistency
            # and let the frontend format it if needed, or format here:
            date_str = date.strftime("%b %d, %Y")
            data_points.append({
                "date": date_str,
                "close": float(row["Close"])
            })
            
        return {
            "ticker": ticker,
            "time_range": time_range,
            "data": data_points
        }
    except Exception as e:
        logger.warning("Error fetching historical data for %s: %s", ticker, e)
        raise Exception("Historical price data is currently unavailable.")

def fetch_stock_data(ticker_symbol: str) -> dict:
    """
    Fetch company profile, quotes, and financials natively from Finnhub.
    Returns a dict matching StockDataResponse schema.
    Converts all monetary values to INR.
    """
    try:
        symbol = ticker_symbol.upper()
        
        # 1. Company Profile
        profile = finnhub_client.company_profile2(symbol=symbol)
        
        # If the profile is empty, the ticker likely doesn't exist on Finnhub
        if not profile or 'name' not in profile:
            raise ValueError("Ticker not found")
            
        # 2. Quote (Pricing)
        quote = finnhub_client.quote(symbol=symbol)
        
        # 3. Fundamentals
        financials_resp = finnhub_client.company_basic_financials(symbol=symbol, metric='all')
        metrics = financials_resp.get('metric', {})
            
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Invalid stock ticker. Please enter a valid stock symbol (e.g., TSLA, AAPL, MSFT)."
        ) from exc
    except requests.exceptions.RequestException as exc:
        raise HTTPException(
            status_code=504,
            detail="Finnhub API timed out. Please try again later."
        ) from exc
    except Exception as exc:
        if 'Read timed out' in str(exc) or 'Timeout' in str(exc):
            raise HTTPException(
                status_code=504,
                detail="Finnhub API timed out. Please try again later."
            ) from exc
        raise HTTPException(
            status_code=500,
            detail=f"Finnhub API error: {str(exc)}"
        ) from exc

    # Determine original currency
    original_currency = profile.get("currency", "USD")

    # Helper function to extract a field without converting to INR
    def get_and_convert(val):
        return _safe_float(val)

    # Basic fields
    current_price = get_and_convert(quote.get("c"))
    if current_price is None or current_price == 0:
        current_price = get_and_convert(quote.get("pc"))
        
    prev_close = get_and_convert(quote.get("pc"))
    
    # Simple market state heuristic (if current price != prev close, it's generally open or traded recently)
    market_state = "Closed"
    if quote.get("c") and quote.get("pc") and quote.get("c") != quote.get("pc"):
        market_state = "Open"
        
    # Get last updated time
    last_updated = datetime.now().strftime("%I:%M %p")
    
    # Process Dividend Yield (Finnhub often provides it as a raw percentage, e.g., 1.5, not 0.015)
    # dividendYieldIndicatedAnnual is common, or dividendYieldTTM
    div_yield = _safe_float(metrics.get("dividendYieldIndicatedAnnual") or metrics.get("dividendYieldTTM"))

    return {
        # Identity
        "company_name": profile.get("name"),
        "symbol": symbol,
        "currency": original_currency,

        "exchange": profile.get("exchange"),
        "industry": profile.get("finnhubIndustry"),
        "sector": None, # Finnhub generally uses industry instead of sector
        "country": profile.get("country"),
        "website": profile.get("weburl"),
        "business_summary": "", # Finnhub free tier doesn't provide a long summary
        "logo_url": profile.get("logo"),
        "last_updated_time": last_updated,

        # Pricing
        "current_price": current_price,
        "previous_close": prev_close,
        "open_price": get_and_convert(quote.get("o")),
        "day_high": get_and_convert(quote.get("h")),
        "day_low": get_and_convert(quote.get("l")),
        "market_state": market_state,

        # 52-week
        "week_52_high": get_and_convert(metrics.get("52WeekHigh")),
        "week_52_low": get_and_convert(metrics.get("52WeekLow")),

        # Fundamentals
        # Finnhub market cap is usually in millions (USD), we need to convert properly if needed.
        # But we'll just extract it directly and convert based on original currency.
        # Note: If it's in millions, the frontend might display it differently. We will pass the converted raw number.
        # Market Capitalization is given in millions in Finnhub (e.g. 3000000 means 3 Trillion)
        # So we multiply by 1,000,000
        "market_cap": get_and_convert(_safe_float(metrics.get("marketCapitalization")) * 1_000_000 if metrics.get("marketCapitalization") else None),
        "volume": None, # Quote doesn't include volume natively on basic free tier easily, although 'v' is sometimes returned
        "average_volume": None, 
        "dividend_yield": div_yield,
        "beta": _safe_float(metrics.get("beta")),
        "pe_ratio": _safe_float(metrics.get("peBasicExclExtraTTM")),
        "eps": get_and_convert(metrics.get("epsExclExtraItemsTTM")),
        # Debt to equity is often annual or TTM
        "debt_to_equity": _safe_float(metrics.get("totalDebt/totalEquityAnnual")),
        "gross_margin": _safe_float(metrics.get("grossMarginTTM")),
    }
