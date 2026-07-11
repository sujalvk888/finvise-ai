# popular.py
from typing import List

POPULAR_STOCKS = [
    {"symbol": "NVDA", "name": "NVIDIA Corporation"},
    {"symbol": "AMD", "name": "Advanced Micro Devices, Inc."},
    {"symbol": "AVGO", "name": "Broadcom Inc."},
    {"symbol": "PLTR", "name": "Palantir Technologies Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "META", "name": "Meta Platforms, Inc."},
    {"symbol": "NFLX", "name": "Netflix, Inc."},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"},
    {"symbol": "TSLA", "name": "Tesla, Inc."}
]

def get_popular_stocks() -> List[dict]:
    """Returns a list of popular tech stocks."""
    return POPULAR_STOCKS
