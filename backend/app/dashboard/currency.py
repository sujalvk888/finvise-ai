from typing import Optional
from datetime import datetime
import requests

# Simple in-memory cache for exchange rates to avoid hitting the external API repeatedly
_exchange_rates_cache = {}
_cache_timestamp = {}

# Cache duration (in seconds)
CACHE_DURATION = 3600  # 1 hour

def get_inr_exchange_rate(from_currency: str) -> float:
    """
    Get the exchange rate from a given currency to INR.
    Uses exchangerate-api as a free, unauthenticated fallback since yfinance was removed.
    """
    if not from_currency or from_currency.upper() == "INR":
        return 1.0

    from_currency = from_currency.upper()
    
    now = datetime.now().timestamp()
    
    # Check cache
    if from_currency in _exchange_rates_cache:
        if now - _cache_timestamp.get(from_currency, 0) < CACHE_DURATION:
            return _exchange_rates_cache[from_currency]

    try:
        # Fetch the latest exchange rates base on from_currency
        url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        rate = data.get("rates", {}).get("INR")
        if rate:
            _exchange_rates_cache[from_currency] = rate
            _cache_timestamp[from_currency] = now
            return rate
    except Exception:
        pass
    
    # Fallback rates if external API fails
    fallbacks = {
        "USD": 83.5,
        "EUR": 90.0,
        "GBP": 105.0,
        "JPY": 0.55,
        "CNY": 11.5,
    }
    return fallbacks.get(from_currency, 1.0)


def convert_to_inr(value: Optional[float], from_currency: Optional[str]) -> Optional[float]:
    """
    Convert a monetary value to INR.
    """
    if value is None:
        return None
        
    if not from_currency or from_currency.upper() == "INR":
        return value
        
    rate = get_inr_exchange_rate(from_currency)
    return value * rate
