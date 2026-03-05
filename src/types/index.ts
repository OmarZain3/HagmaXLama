/** Strict types for HagmaXLama Fantasy – all API and UI models */

export interface Player {
  ID: string;
  Name: string;
  IsGK: boolean;
  Team: string;
  ImageURL: string;
  TotalPoints: number;
  Day1: number;
  Day2: number;
  Day3: number;
  QF: number;
  SF: number;
  Final: number;
}

export interface User {
  UserID: string;
  Name: string;
  TeamName: string;
  CaptainID: string;
  PlayerIDs: string[];
  Subs: string[];
  TransfersUsed: number;
}

export interface Round {
  Round: number;
  Active: boolean;
  MaxTransfers: number;
  MaxPerTeam: number;
  AllowSubs: boolean;
  TransferWindow: boolean;
  MatchInPlay: boolean;
}

export interface TeamState {
  captainId: string;
  playerIds: string[];
  subs: string[];
  transfersUsed: number;
}

export interface LeaderboardEntry {
  UserID: string;
  Name: string;
  TeamName: string;
  TotalPoints: number;
  Day1: number;
  Day2: number;
  Day3: number;
  QF: number;
  SF: number;
  Final: number;
}

export interface PointsEntry {
  Round: number;
  PlayerID: string;
  Goals: number;
  Assists: number;
  CleanSheet: number;
  YC: number;
  '2YC': number;
  RC: number;
  PenSave: number;
  PenGoal: number;
  PenMiss: number;
  OwnGoal: number;
  Conceded: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type RoundKey = 'Day1' | 'Day2' | 'Day3' | 'QF' | 'SF' | 'Final';

export const ROUND_LABELS: Record<number, string> = {
  1: 'Day 1',
  2: 'Day 2',
  3: 'Day 3',
  4: 'Quarter Finals',
  5: 'Semi Finals',
  6: 'Final',
};
