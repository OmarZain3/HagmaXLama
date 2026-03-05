import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/api/api';

export interface RoundState {
  ActiveRound: number;
  TransferWindow: boolean;
  AllowSubs: boolean;
  MatchInPlay: boolean;
}

interface RoundContextValue {
  state: RoundState | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const defaultState: RoundState = {
  ActiveRound: 0,
  TransferWindow: false,
  AllowSubs: false,
  MatchInPlay: false,
};

const RoundContext = createContext<RoundContextValue | null>(null);

export function RoundProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RoundState | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getRoundState({});
      if (res.success && res.data) {
        setState(res.data);
      } else {
        setState(defaultState);
      }
    } catch {
      setState(defaultState);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const t = setInterval(refetch, 30000);
    return () => clearInterval(t);
  }, [refetch]);

  const value: RoundContextValue = { state, loading, refetch };
  return <RoundContext.Provider value={value}>{children}</RoundContext.Provider>;
}

export function useRound(): RoundContextValue {
  const ctx = useContext(RoundContext);
  if (!ctx) throw new Error('useRound must be used within RoundProvider');
  return ctx;
}
