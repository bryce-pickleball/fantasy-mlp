import type { Event, Lineup, LineupScore, Player, Team } from "../types";
import { dbAdapter } from "./db";
import { mockAdapter } from "./mock";

export interface DataAdapter {
  getTeams(): Promise<Team[]>;
  getPlayers(): Promise<Player[]>;
  getPlayersForEvent(eventId: string): Promise<Player[]>;
  getEvents(): Promise<Event[]>;
  getEvent(eventId: string): Promise<Event | null>;
  saveLineup(lineup: Lineup): Promise<void>;
  getLineup(eventId: string, ownerId: string): Promise<Lineup | null>;
  getLeaderboard(eventId: string): Promise<LineupScore[]>;
}

export const data: DataAdapter = process.env.USE_MOCK_DATA === "1" ? mockAdapter : dbAdapter;
