"""
Financial metric validation layer to ensure data reliability before reaching the frontend or AI.
"""

def validate_stock_data(data: dict) -> dict:
    flags = {
        "pe_invalid_negative_eps": False,
        "gross_margin_invalid": False
    }

    # 1. Validate P/E Ratio
    eps = data.get("eps")
    if eps is not None and eps <= 0:
        data["pe_ratio"] = None
        flags["pe_invalid_negative_eps"] = True

    # 2. Validate Gross Margin
    gm = data.get("gross_margin")
    if gm is not None:
        if gm > 100 or gm < -100:
            data["gross_margin"] = None
            flags["gross_margin_invalid"] = True

    data["validation_flags"] = flags
    return data
