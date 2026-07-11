'use client';

/**
 * AiEngineContext — Global AI engine preference.
 * 
 * The selected engine ('groq' | 'ollama') is persisted in localStorage
 * so it survives page refreshes. The Header badge and AI Advisory panel
 * both read from this context to stay in sync.
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type AiEngine = 'groq' | 'ollama';

interface AiEngineContextValue {
  engine: AiEngine;
  setEngine: (engine: AiEngine) => void;
  engineLabel: string;       // e.g. "Groq / Llama 3.3 70B"
  engineModeLabel: string;   // e.g. "MODE: GROQ (Llama 3.3 70B)"
}

const ENGINE_LABELS: Record<AiEngine, { label: string; modeLabel: string }> = {
  groq: {
    label: 'Groq / Llama 3.3 70B',
    modeLabel: 'MODE: GROQ (Llama 3.3 70B)',
  },
  ollama: {
    label: 'Ollama / phi3:mini',
    modeLabel: 'MODE: OLLAMA (phi3:mini)',
  },
};

const BASE_STORAGE_KEY = 'finvise_ai_engine';

function getStorageKey(): string {
  if (typeof window === 'undefined') return BASE_STORAGE_KEY;
  const userId = localStorage.getItem('finvise_user_id');
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

const AiEngineContext = createContext<AiEngineContextValue | null>(null);

export function AiEngineProvider({ children }: { children: ReactNode }) {
  const [engine, setEngineState] = useState<AiEngine>('groq');

  // Load persisted preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey()) as AiEngine | null;
      if (stored && (stored === 'groq' || stored === 'ollama')) {
        setTimeout(() => setEngineState(stored), 0);
      }
    } catch {
      // localStorage may not be available in SSR — safe to ignore
    }
  }, []);

  const setEngine = useCallback((newEngine: AiEngine) => {
    setEngineState(newEngine);
    try {
      localStorage.setItem(getStorageKey(), newEngine);
    } catch {
      // ignore
    }
  }, []);

  const { label, modeLabel } = ENGINE_LABELS[engine];

  return (
    <AiEngineContext.Provider
      value={{ engine, setEngine, engineLabel: label, engineModeLabel: modeLabel }}
    >
      {children}
    </AiEngineContext.Provider>
  );
}

export function useAiEngine(): AiEngineContextValue {
  const ctx = useContext(AiEngineContext);
  if (!ctx) throw new Error('useAiEngine must be used inside <AiEngineProvider>');
  return ctx;
}
