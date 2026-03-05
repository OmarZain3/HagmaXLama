/**
 * API client for Google Apps Script backend.
 * All scoring and rule validation is server-side; frontend only sends actions.
 */

import type { ApiResponse } from '@/types';

// Use dev-server proxy to avoid browser CORS issues with Apps Script.
// In dev: Vite proxies /api -> VITE_API_URL.
const API_BASE = '/api';

async function post<T>(body: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      try {
        const json = await res.json() as ApiResponse<T>;
        return { success: false, error: json.error ?? `Request failed (${res.status})` };
      } catch {
        // Response is not JSON (e.g., HTML error page)
        const text = await res.text();
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          return { success: false, error: 'Server error: Backend not properly deployed. Please check the Google Apps Script deployment.' };
        }
        return { success: false, error: `Request failed with status ${res.status}` };
      }
    }
    
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (e) {
    const errorMsg = (e as Error).message || 'Network error';
    // Check if it's a SyntaxError from invalid JSON
    if (errorMsg.includes('Unexpected token') || errorMsg.includes('JSON')) {
      return { success: false, error: 'Server error: Backend not responding with valid JSON. Please check deployment.' };
    }
    // Check if it's a fetch error
    if (errorMsg.includes('fetch') || errorMsg.includes('Failed to') || !API_BASE) {
      return { success: false, error: 'Cannot connect to server. Check API URL and CORS settings.' };
    }
    return { success: false, error: errorMsg };
  }
}

export const api = {
  registerUser(payload: { name: string; teamName: string; password: string }) {
    return post<{ UserID: string }>({ action: 'registerUser', ...payload });
  },

  loginUser(payload: { name: string; password: string }) {
    return post<{ UserID: string; Name: string; TeamName: string }>({ action: 'loginUser', ...payload });
  },

  addPlayerToTeam(payload: { userId: string; playerId: string }) {
    return post<{ message: string }>({ action: 'addPlayerToTeam', ...payload });
  },

  selectCaptain(payload: { userId: string; captainId: string }) {
    return post<{ message: string }>({ action: 'selectCaptain', ...payload });
  },

  substitutePlayer(payload: { userId: string; outPlayerId: string; inPlayerId: string }) {
    return post<{ message: string }>({ action: 'substitutePlayer', ...payload });
  },

  transferPlayer(payload: { userId: string; outPlayerId: string; inPlayerId: string }) {
    return post<{ message: string }>({ action: 'transferPlayer', ...payload });
  },

  viewMyPlayers(payload: { userId: string }) {
    return post<{ players: unknown[]; subs: unknown[]; captainId: string }>({ action: 'viewMyPlayers', ...payload });
  },

  viewAllPlayers(payload: object) {
    return post<{ players: unknown[] }>({ action: 'viewAllPlayers', ...payload });
  },

  viewLeaderboard(payload: object) {
    return post<{ leaderboard: unknown[] }>({ action: 'viewLeaderboard', ...payload });
  },

  getRoundState(payload: object) {
    return post<{
      ActiveRound: number;
      TransferWindow: boolean;
      AllowSubs: boolean;
      MatchInPlay: boolean;
    }>({ action: 'getRoundState', ...payload });
  },

  // Admin
  adminUpdateStats(payload: Record<string, unknown>) {
    return post<{ message: string }>({ action: 'adminUpdateStats', ...payload });
  },

  updateLeaderboard(payload: object) {
    return post<{ message: string }>({ action: 'updateLeaderboard', ...payload });
  },

  toggleRoundState(payload: Record<string, unknown>) {
    return post<{ message: string }>({ action: 'toggleRoundState', ...payload });
  },

  adminImportPlayers(payload: { overwrite: boolean }) {
    return post<{ imported: number; sourceSheet: string }>({ action: 'adminImportPlayers', ...payload });
  },
};
