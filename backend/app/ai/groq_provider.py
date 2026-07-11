"""
groq_provider.py — Calls the Groq Cloud API for financial analysis.
Uses the official groq-python SDK for fast LLM inference.
"""

import os
import json
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Import is deferred so missing package only errors at call time
def _get_groq_client():
    try:
        from groq import Groq  # type: ignore
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key or api_key == "your_groq_api_key_here":
            raise ValueError("GROQ_API_KEY is not configured.")
        return Groq(api_key=api_key)
    except ImportError:
        raise RuntimeError("groq package not installed. Run: pip install groq")


def _parse_ai_response(raw_text: str) -> Dict[str, Any]:
    """Extract and parse the JSON block from the LLM response."""
    # Try to find a JSON block in the response
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not json_match:
        raise ValueError("AI response did not contain a valid JSON block.")
    
    parsed = json.loads(json_match.group(0))
    
    # Validate required fields
    required = ["company_summary", "strengths", "risks", "verdict_label", "verdict_text"]
    for field in required:
        if field not in parsed:
            raise ValueError(f"AI response missing required field: {field}")
    
    return parsed


def run_groq_analysis(prompt: str) -> Dict[str, Any]:
    """
    Send the prompt to Groq and return parsed JSON analysis.
    Raises RuntimeError on any failure with a user-friendly message.
    """
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    try:
        client = _get_groq_client()
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial analyst AI. Always respond with valid JSON only. Do not add any text outside the JSON block."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=model,
            temperature=0.3,       # Low temperature for factual, consistent analysis
            max_tokens=1500,
            timeout=30,
        )
        
        raw_text = chat_completion.choices[0].message.content or ""
        return _parse_ai_response(raw_text)
        
    except ValueError as e:
        # Configuration or parsing errors
        logger.error(f"Groq parse/config error. Error: {str(e)}\nRaw response: {raw_text if 'raw_text' in locals() else 'N/A'}")
        raise RuntimeError(str(e))
    except Exception as e:
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            raise RuntimeError("Groq API key is invalid or missing. Please check your GROQ_API_KEY in .env")
        if "timeout" in error_msg.lower():
            raise RuntimeError("Groq API request timed out. Please try again.")
        if "rate_limit" in error_msg.lower():
            raise RuntimeError("Groq API rate limit reached. Please wait a moment and try again.")
        raise RuntimeError(f"Groq API error: {error_msg}")
