import type { Event, Lineup, LineupScore, Player, Team } from "../types";
import type { DataAdapter } from "./adapter";
import { prisma } from "../db";

function rowToEvent(e: { id: string; name: string; startsAt: Date; locksAt: Date; teamIds: string }): Event {
  return {
    id: e.id,
    name: e.name,
    startsAt: e.startsAt.toISOString(),
    locksAt: e.locksAt.toISOString(),
    teamIds: e.teamIds.split(",").filter(Boolean),
  };
}

function rowToPlayer(p: { id: string; name: string; gender: string; salary: number; rating: number; teamId: string }): Player {
  return { id: p.id, name: p.name, gender: p.gender as "M" | "W", salary: p.salary, rating: p.rating, teamId: p.teamId };
}

function fakeScore(playerId: string, ownerId: string): number {
  const seed = [...(playerId + ownerId)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return Math.round(((seed % 23) + 12) * 1.3 * 10) / 10;
}

export const dbAdapter: DataAdapter = {
  async getTeams() {
    const ts = await prisma.team.findMany({ orderBy: { name: "asc" } });
    return ts.map((t) => ({ id: t.id, name: t.name, abbr: t.abbr })) as Team[];
  },
  async getPlayers() {
    const ps = await prisma.player.findMany();
    return ps.map(rowToPlayer);
  },
  async getPlayersForEvent(eventId: string) {
    const ev = await prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) return [];
    const teamIds = ev.teamIds.split(",").filter(Boolean);
    const ps = await prisma.player.findMany({ where: { teamId: { in: teamIds } } });
    return ps.map(rowToPlayer);
  },
  async getEvents() {
    const es = await prisma.event.findMany({ orderBy: { startsAt: "asc" } });
    return es.map(rowToEvent);
  },
  async getEvent(eventId: string) {
    const e = await prisma.event.findUnique({ where: { id: eventId } });
    return e ? rowToEvent(e) : null;
  },
  async saveLineup(lineup: Lineup) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.lineup.findUnique({
        where: { eventId_ownerId: { eventId: lineup.eventId, ownerId: lineup.ownerId } },
      });
      if (existing) {
        await tx.lineupPlayer.deleteMany({ where: { lineupId: existing.id } });
        await tx.lineup.update({ where: { id: existing.id }, data: { submittedAt: new Date() } });
        await tx.lineupPlayer.createMany({
          data: lineup.playerIds.map((pid, i) => ({ lineupId: existing.id, playerId: pid, slot: i })),
        });
      } else {
        const created = await tx.lineup.create({
          data: { eventId: lineup.eventId, ownerId: lineup.ownerId },
        });
        await tx.lineupPlayer.createMany({
          data: lineup.playerIds.map((pid, i) => ({ lineupId: created.id, playerId: pid, slot: i })),
        });
      }
    });
  },
  async getLineup(eventId: string, ownerId: string) {
    const row = await prisma.lineup.findUnique({
      where: { eventId_ownerId: { eventId, ownerId } },
      include: { picks: { orderBy: { slot: "asc" } } },
    });
    if (!row) return null;
    return {
      eventId: row.eventId,
      ownerId: row.ownerId,
      playerIds: row.picks.map((p) => p.playerId),
      submittedAt: row.submittedAt.toISOString(),
    };
  },
  async getLeaderboard(eventId: string) {
    // For now: every league member gets a fake score based on their submitted (or random) lineup.
    // Real scoring lands with the live worker in v0.4.
    const users = await prisma.user.findMany();
    const board: LineupScore[] = [];
    for (const u of users) {
      const lineup = await prisma.lineup.findUnique({
        where: { eventId_ownerId: { eventId, ownerId: u.id } },
        include: { picks: { orderBy: { slot: "asc" } } },
      });
      const ids = lineup?.picks.map((p) => p.playerId) ?? [];
      const perPlayer = ids.map((pid) => ({ playerId: pid, total: fakeScore(pid, u.id), breakdown: [] }));
      const total = Math.round(perPlayer.reduce((s, p) => s + p.total, 0) * 10) / 10;
      board.push({ eventId, ownerId: u.id, total, perPlayer });
    }
    return board.sort((a, b) => b.total - a.total);
  },
};
