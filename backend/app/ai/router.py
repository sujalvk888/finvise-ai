"""
router.py — AI engine routing layer.
Dispatches analysis requests to the correct provider (Groq or Ollama)
based on the requested engine parameter.
"""

from typing import Dict, Any
from app.ai.prompt_builder import build_analysis_prompt
from app.ai.groq_provider import run_groq_analysis
from app.ai.ollama_provider import run_ollama_analysis

SUPPORTED_ENGINES = {"groq", "ollama"}


def run_ai_analysis(stock_data: Dict[str, Any], engine: str) -> Dict[str, Any]:
    """
    Route the AI analysis request to the appropriate provider.
    
    Args:
        stock_data: Verified financial data dict from fetch_stock_data()
        engine: 'groq' or 'ollama'
    
    Returns:
        Dict with keys: company_summary, strengths, risks, verdict_label, verdict_text
    
    Raises:
        ValueError: If the engine is not supported.
        RuntimeError: If the selected engine fails. Message is user-friendly.
    """
    engine = engine.lower().strip()
    
    if engine not in SUPPORTED_ENGINES:
        raise ValueError(
            f"Unsupported AI engine: '{engine}'. "
            f"Supported engines: {', '.join(SUPPORTED_ENGINES)}"
        )
    
    # Build the structured prompt from verified data
    prompt = build_analysis_prompt(stock_data)
    
    # Dispatch to the selected provider
    if engine == "groq":
        return run_groq_analysis(prompt)
    else:  # ollama
        try:
            return run_ollama_analysis(prompt)
        except Exception as e:
            # Fallback to groq
            fallback_result = run_groq_analysis(prompt)
            fallback_result["verdict_text"] = f"[Fallback to Groq due to local AI error] {fallback_result.get('verdict_text', '')}"
            return fallback_result
