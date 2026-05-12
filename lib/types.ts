export type Gender = "M" | "W";

export interface Team {
  id: string;
  name: string;
  abbr: string;
  logoUrl?: string | null;
}

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  teamId: string;
  salary: number;
  rating: number;
  imageUrl?: string | null;
}

export interface Event {
  id: string;
  name: string;
  startsAt: string;
  teamIds: string[];
  locksAt: string;
}

export interface Lineup {
  eventId: string;
  ownerId: string;
  playerIds: string[];
  submittedAt?: string;
}

export interface GameStat {
  playerId: string;
  points: number;
  winners: number;
  errors: number;
  aces: number;
  won: boolean;
  dreambreakerWon?: boolean;
}

export interface MatchResult {
  matchId: string;
  stats: GameStat[];
}

export interface PlayerScore {
  playerId: string;
  total: number;
  breakdown: { label: string; value: number }[];
}

export interface LineupScore {
  eventId: string;
  ownerId: string;
  total: number;
  perPlayer: PlayerScore[];
}

export const LINEUP_SIZE = 6;
export const LINEUP_MEN = 3;
export const LINEUP_WOMEN = 3;
export const SALARY_CAP = 50000;
