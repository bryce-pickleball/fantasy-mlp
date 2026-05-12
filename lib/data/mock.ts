import type { Event, Lineup, LineupScore, Player, Team } from "../types";
import type { DataAdapter } from "./adapter";
import { events } from "./events";
import { players } from "./players";
import { teams } from "./teams";

const lineupStore = new Map<string, Lineup>();

function fakeScore(playerId: string): number {
  const seed = [...playerId].reduce((s, c) => s + c.charCodeAt(0), 0);
  return Math.round(((seed % 23) + 12) * 1.3 * 10) / 10;
}

export const mockAdapter: DataAdapter = {
  async getTeams() {
    return teams;
  },
  async getPlayers() {
    return players;
  },
  async getPlayersForEvent(eventId: string) {
    const e = events.find((x) => x.id === eventId);
    if (!e) return [];
    return players.filter((p) => e.teamIds.includes(p.teamId));
  },
  async getEvents() {
    return events;
  },
  async getEvent(eventId: string) {
    return events.find((e) => e.id === eventId) ?? null;
  },
  async saveLineup(lineup: Lineup) {
    lineupStore.set(`${lineup.eventId}:${lineup.ownerId}`, {
      ...lineup,
      submittedAt: new Date().toISOString(),
    });
  },
  async getLineup(eventId: string, ownerId: string) {
    return lineupStore.get(`${eventId}:${ownerId}`) ?? null;
  },
  async getLeaderboard(eventId: string) {
    const owners = ["you", "Pickle Pete", "Drink the Punch", "Court Jester", "Net Profit", "Lobsterix"];
    return owners.map((ownerId) => {
      const ids = pickSample(players, ownerId);
      const perPlayer = ids.map((id) => ({ playerId: id, total: fakeScore(id + ownerId), breakdown: [] }));
      const total = Math.round(perPlayer.reduce((s, p) => s + p.total, 0) * 10) / 10;
      return { eventId, ownerId, total, perPlayer };
    }).sort((a, b) => b.total - a.total);
  },
};

function pickSample(list: Player[], seedKey: string): string[] {
  const seed = [...seedKey].reduce((s, c) => s + c.charCodeAt(0), 0);
  const men = list.filter((p) => p.gender === "M");
  const women = list.filter((p) => p.gender === "W");
  const pick = (arr: Player[], n: number, off: number) =>
    Array.from({ length: n }, (_, i) => arr[(seed + off + i * 3) % arr.length].id);
  return [...pick(men, 3, 0), ...pick(women, 3, 7)];
}
