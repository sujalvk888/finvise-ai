"""
Dashboard routes — all endpoints prefixed /api/dashboard.
Business logic lives in services.py; this file stays thin.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.auth.deps import get_current_user
from app.dashboard.schemas import (
    StockDataResponse, StockRequest, ErrorResponse,
    HistoricalDataResponse, AiReportRequest, AiReportResponse
)
from app.dashboard.services import fetch_stock_data, get_historical_data
from app.ai.router import run_ai_analysis

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.post(
    "/stock",
    response_model=StockDataResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Empty or invalid ticker format"},
        404: {"model": ErrorResponse, "description": "Ticker not found on Finnhub"},
        502: {"model": ErrorResponse, "description": "Finnhub unavailable"},
        503: {"model": ErrorResponse, "description": "API key not configured"},
    },
)
def analyze_stock(
    request: StockRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Fetch real-time stock data for a given ticker from Finnhub.
    Requires authentication. Input is trimmed and uppercased before lookup.
    """
    ticker = request.ticker.strip().upper()

    if not ticker:
        raise HTTPException(
            status_code=400,
            detail="Please enter a stock ticker.",
        )

    return fetch_stock_data(ticker)


@router.get("/summary")
def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    """Legacy summary endpoint — kept for backwards compatibility."""
    return {
        "message": f"Welcome to the dashboard, {current_user.name}!",
        "status": "Dashboard is live.",
    }


@router.get(
    "/history",
    response_model=HistoricalDataResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Missing parameters"},
        500: {"model": ErrorResponse, "description": "Internal server error fetching data"},
    },
)
def fetch_history(
    ticker: str,
    range: str,
    current_user: User = Depends(get_current_user),
):
    """
    Fetch historical stock data for a given ticker and range.
    Requires authentication.
    """
    ticker = ticker.strip().upper()
    range = range.strip().upper()

    if not ticker or not range:
        raise HTTPException(
            status_code=400,
            detail="Ticker and range parameters are required.",
        )
        
    try:
        return get_historical_data(ticker, range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/analyze-ai",
    response_model=AiReportResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid ticker or engine"},
        500: {"model": ErrorResponse, "description": "AI engine failure"},
        503: {"model": ErrorResponse, "description": "AI engine unavailable"},
    },
)
def analyze_with_ai(
    request: AiReportRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI financial analysis report for a given ticker.
    Fetches verified financial data, builds a structured prompt,
    and routes to the selected AI engine (groq or ollama).
    """
    ticker = request.ticker.strip().upper()
    engine = request.engine.lower().strip()

    if not ticker:
        raise HTTPException(status_code=400, detail="Please enter a stock ticker.")

    # Step 1: Fetch verified financial data
    try:
        stock_data = fetch_stock_data(ticker)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve stock data: {str(exc)}"
        ) from exc

    # Step 2: Route to selected AI engine
    try:
        result = run_ai_analysis(stock_data, engine)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI analysis at this time."
        ) from exc

    return AiReportResponse(
        engine=engine,
        company_summary=result.get("company_summary", ""),
        strengths=result.get("strengths", []),
        risks=result.get("risks", []),
        verdict_label=result.get("verdict_label", "Hold"),
        verdict_text=result.get("verdict_text", ""),
    )


@router.get("/popular")
def fetch_popular_stocks(current_user: User = Depends(get_current_user)):
    """
    Returns a list of popular tech stocks for the watchlist add modal.
    """
    from app.dashboard.popular import get_popular_stocks
    return get_popular_stocks()

