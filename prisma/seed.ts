import { PrismaClient } from "@prisma/client";
import { players } from "../lib/data/players";
import { teams } from "../lib/data/teams";
import { events } from "../lib/data/events";

const prisma = new PrismaClient();

async function main() {
  // ---- users ----------------------------------------------------------------
  await prisma.user.upsert({
    where: { id: "you" },
    update: {},
    create: { id: "you", name: "You", email: "you@fantasy-mlp.local" },
  });
  const friends = [
    { id: "u_pete", name: "Pickle Pete" },
    { id: "u_punch", name: "Drink the Punch" },
    { id: "u_jester", name: "Court Jester" },
    { id: "u_net", name: "Net Profit" },
    { id: "u_lob", name: "Lobsterix" },
  ];
  for (const f of friends) {
    await prisma.user.upsert({ where: { id: f.id }, update: {}, create: f });
  }

  // ---- teams ---------------------------------------------------------------
  const teamIds = new Set(teams.map((t) => t.id));
  // remove stale teams (and their players via cascade — Player.teamId is required
  // so we delete players on stale teams first to avoid FK errors)
  const staleTeams = await prisma.team.findMany({ where: { id: { notIn: [...teamIds] } } });
  if (staleTeams.length) {
    const staleTeamIds = staleTeams.map((t) => t.id);
    await prisma.lineupPlayer.deleteMany({ where: { player: { teamId: { in: staleTeamIds } } } });
    await prisma.player.deleteMany({ where: { teamId: { in: staleTeamIds } } });
    await prisma.team.deleteMany({ where: { id: { in: staleTeamIds } } });
    console.log(`Removed ${staleTeams.length} stale team(s) and their players.`);
  }
  for (const t of teams) {
    await prisma.team.upsert({ where: { id: t.id }, update: t, create: t });
  }

  // ---- players -------------------------------------------------------------
  const playerIds = new Set(players.map((p) => p.id));
  const stalePlayers = await prisma.player.findMany({ where: { id: { notIn: [...playerIds] } } });
  if (stalePlayers.length) {
    const stalePlayerIds = stalePlayers.map((p) => p.id);
    await prisma.lineupPlayer.deleteMany({ where: { playerId: { in: stalePlayerIds } } });
    await prisma.player.deleteMany({ where: { id: { in: stalePlayerIds } } });
    console.log(`Removed ${stalePlayers.length} stale player(s).`);
  }
  for (const p of players) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: { name: p.name, gender: p.gender, salary: p.salary, rating: p.rating, imageUrl: p.imageUrl ?? null, teamId: p.teamId },
      create: { id: p.id, name: p.name, gender: p.gender, salary: p.salary, rating: p.rating, imageUrl: p.imageUrl ?? null, teamId: p.teamId },
    });
  }

  // ---- events --------------------------------------------------------------
  const eventIds = new Set(events.map((e) => e.id));
  // Remove stale events (old demo events from earlier deploys)
  const staleEvents = await prisma.event.findMany({ where: { id: { notIn: [...eventIds] } } });
  if (staleEvents.length) {
    const staleEventIds = staleEvents.map((e) => e.id);
    await prisma.lineupPlayer.deleteMany({ where: { lineup: { eventId: { in: staleEventIds } } } });
    await prisma.lineup.deleteMany({ where: { eventId: { in: staleEventIds } } });
    await prisma.event.deleteMany({ where: { id: { in: staleEventIds } } });
    console.log(`Removed ${staleEvents.length} stale event(s) and their lineups.`);
  }
  const eventTeamIds = teams.map((t) => t.id);
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: {
        name: e.name,
        startsAt: new Date(e.startsAt),
        locksAt: new Date(e.locksAt),
        teamIds: eventTeamIds.join(","),
      },
      create: {
        id: e.id,
        name: e.name,
        startsAt: new Date(e.startsAt),
        locksAt: new Date(e.locksAt),
        teamIds: eventTeamIds.join(","),
      },
    });
  }

  // ---- demo league ---------------------------------------------------------
  const league = await prisma.league.upsert({
    where: { id: "lg_pickle_pals" },
    update: {},
    create: { id: "lg_pickle_pals", name: "The Pickle Pals", commissionerId: "you" },
  });
  const allMembers = ["you", ...friends.map((f) => f.id)];
  for (const userId of allMembers) {
    await prisma.leagueMember.upsert({
      where: { leagueId_userId: { leagueId: league.id, userId } },
      update: {},
      create: { leagueId: league.id, userId, role: userId === "you" ? "commissioner" : "member" },
    });
  }
  const existing = await prisma.leagueMessage.count({ where: { leagueId: league.id } });
  if (existing === 0) {
    await prisma.leagueMessage.createMany({
      data: [
        { leagueId: league.id, authorId: "u_pete", body: "stacking JW and Bright. cap is loose this week." },
        { leagueId: league.id, authorId: "u_jester", body: "lol Ben Johns is overpriced. take Federico." },
        { leagueId: league.id, authorId: "you", body: "we'll see who's laughing at first serve." },
      ],
    });
  }

  console.log(`Seed complete. ${teams.length} teams, ${players.length} players.`);
}

main().finally(() => prisma.$disconnect());
