"""
ollama_provider.py — Calls a local Ollama instance for financial analysis.
Uses httpx for HTTP calls to the Ollama REST API.
"""

import os
import json
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def _parse_ai_response(raw_text: str) -> Dict[str, Any]:
    """Extract and parse the JSON block from the LLM response."""
    json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not json_match:
        raise ValueError("AI response did not contain a valid JSON block.")
    
    parsed = json.loads(json_match.group(0))
    
    required = ["company_summary", "strengths", "risks", "verdict_label", "verdict_text"]
    for field in required:
        if field not in parsed:
            raise ValueError(f"AI response missing required field: {field}")
    
    return parsed


def run_ollama_analysis(prompt: str) -> Dict[str, Any]:
    """
    Send the prompt to a local Ollama instance and return parsed JSON analysis.
    Raises RuntimeError on any failure with a user-friendly message.
    """
    try:
        import httpx
    except ImportError:
        raise RuntimeError("httpx package not installed. Run: pip install httpx")
    
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "phi3:mini")
    
    api_url = f"{base_url}/api/chat"
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a financial analyst AI. Always respond with valid JSON only. Do not add any text outside the JSON block."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 1500,
        }
    }
    
    try:
        timeout = httpx.Timeout(80.0, connect=3.0)
        with httpx.Client(timeout=timeout) as client:
            # Quick ping to fail fast if unavailable
            try:
                ping = client.get(f"{base_url}/api/tags", timeout=3.0)
                if ping.status_code != 200:
                    raise RuntimeError("Ollama service is unavailable.")
            except (httpx.ConnectError, httpx.TimeoutException):
                raise RuntimeError("Ollama service is unavailable or not running.")
                
            response = client.post(api_url, json=payload)
        
        if response.status_code == 404:
            raise RuntimeError(
                f"Ollama model '{model}' not found. "
                f"Please run: ollama pull {model}"
            )
        
        if response.status_code != 200:
            raise RuntimeError(
                f"Ollama returned status {response.status_code}. "
                "Make sure Ollama is running: ollama serve"
            )
        
        data = response.json()
        raw_text = data.get("message", {}).get("content", "")
        
        if not raw_text:
            raise ValueError("Ollama returned an empty response.")
        
        return _parse_ai_response(raw_text)
        
    except httpx.ConnectError:
        raise RuntimeError(
            "Unable to generate analysis using Ollama. "
            "Please ensure the Ollama server is running and the selected model is installed."
        )
    except httpx.TimeoutException:
        raise RuntimeError(
            "Ollama request timed out. "
            "The model may be loading — please try again in a moment."
        )
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse Ollama response. Error: {str(e)}\nRaw response: {raw_text if 'raw_text' in locals() else 'N/A'}")
        raise RuntimeError(f"Failed to parse Ollama response: {str(e)}")
