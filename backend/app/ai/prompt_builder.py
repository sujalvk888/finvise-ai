"""
prompt_builder.py — Builds a structured, hallucination-resistant prompt
from verified financial data. The LLM never needs to look up data itself.
"""

from typing import Dict, Any, Optional


def _fmt(val: Optional[float], decimals: int = 2, prefix: str = "") -> str:
    """Format a float or return 'N/A'."""
    if val is None:
        return "N/A"
    return f"{prefix}{val:,.{decimals}f}"


def build_analysis_prompt(stock: Dict[str, Any]) -> str:
    """
    Build a structured financial analysis prompt from a StockDataResponse dict.
    All values come from verified Finnhub + yfinance sources — the AI must not
    invent any additional data beyond what is supplied here.
    """

    name = stock.get("company_name") or stock.get("symbol", "Unknown Company")
    symbol = stock.get("symbol", "")
    industry = stock.get("industry") or "N/A"
    sector = stock.get("sector") or industry
    country = stock.get("country") or "N/A"
    existing_summary = (stock.get("business_summary") or "").strip()

    price = _fmt(stock.get("current_price"), prefix="₹")
    prev_close = _fmt(stock.get("previous_close"), prefix="₹")
    day_high = _fmt(stock.get("day_high"), prefix="₹")
    day_low = _fmt(stock.get("day_low"), prefix="₹")
    week_52_high = _fmt(stock.get("week_52_high"), prefix="₹")
    week_52_low = _fmt(stock.get("week_52_low"), prefix="₹")

    market_cap_raw = stock.get("market_cap")
    if market_cap_raw and market_cap_raw >= 1e12:
        market_cap = f"₹{market_cap_raw / 1e12:.2f}T"
    elif market_cap_raw and market_cap_raw >= 1e9:
        market_cap = f"₹{market_cap_raw / 1e9:.2f}B"
    elif market_cap_raw:
        market_cap = f"₹{market_cap_raw:,.0f}"
    else:
        market_cap = "N/A"

    pe_ratio = _fmt(stock.get("pe_ratio"))
    eps = _fmt(stock.get("eps"), prefix="₹")
    debt_to_equity = _fmt(stock.get("debt_to_equity"))
    gross_margin = _fmt(stock.get("gross_margin")) if stock.get("gross_margin") else "N/A"
    beta = _fmt(stock.get("beta"))
    dividend_yield = _fmt(stock.get("dividend_yield"))

    # Format gross margin as percentage if available
    flags = stock.get("validation_flags", {})
    if flags.get("gross_margin_invalid"):
        gross_margin = "Gross margin data is unavailable or inconsistent and has been excluded from this analysis."
    else:
        gm_raw = stock.get("gross_margin")
        gross_margin = f"{gm_raw:.2f}%" if gm_raw is not None else "N/A"

    summary_instruction = (
        f'The company already has a business summary provided: "{existing_summary}". '
        "Use it as-is for the Company Summary section."
        if existing_summary
        else (
            "No business summary was provided by the data source. "
            "Write a concise 3–5 sentence Company Summary based ONLY on the company name, "
            "industry, country, and publicly known facts about this company. "
            "Do not invent financial details."
        )
    )

    prompt = f"""You are a professional financial analyst AI embedded in the FinVise.AI platform.
Your task is to analyze the following structured financial data and produce a structured advisory report.

CRITICAL RULES:
- Never invent financial values, events, earnings, or trends not present in the data below.
- If data is insufficient to support a conclusion, say so explicitly.
- Use hedged language: "Based on available data...", "Current metrics suggest...", "Available information indicates..."
- Every strength and risk bullet must be supported by the financial data provided.

---
COMPANY DATA (all monetary values in INR):

Company: {name} ({symbol})
Industry: {industry}
Sector: {sector}
Country: {country}

Current Price: {price}
Previous Close: {prev_close}
Day High: {day_high}
Day Low: {day_low}
52-Week High: {week_52_high}
52-Week Low: {week_52_low}
Market Cap: {market_cap}

P/E Ratio (TTM): {pe_ratio}
EPS (TTM): {eps}
Gross Profit Margin: {gross_margin}
Debt-to-Equity: {debt_to_equity}
Beta: {beta}
Dividend Yield: {dividend_yield}

Business Summary instruction: {summary_instruction}
---

Produce your response in the EXACT JSON format below. Do not include any text outside the JSON block.

{{
  "company_summary": "3-5 sentence company summary here.",
  "strengths": [
    "Bullet point 1 supported by data",
    "Bullet point 2 supported by data",
    "Bullet point 3 supported by data"
  ],
  "risks": [
    "Bullet point 1 supported by data",
    "Bullet point 2 supported by data",
    "Bullet point 3 supported by data"
  ],
  "verdict_label": "Hold",
  "verdict_text": "2-4 sentence balanced verdict. Must reference specific metrics from the data."
}}

verdict_label must be exactly one of: "Strong Buy", "Buy", "Hold", "Reduce", "Sell"
Generate 3-5 bullets for both strengths and risks. Be concise and professional."""

    return prompt
