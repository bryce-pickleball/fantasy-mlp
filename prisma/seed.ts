import { PrismaClient } from "@prisma/client";
import { players } from "../lib/data/players";
import { teams } from "../lib/data/teams";
import { events } from "../lib/data/events";

const prisma = new PrismaClient();

async function main() {
  // demo user (no auth yet — everyone is "you")
  await prisma.user.upsert({
    where: { id: "you" },
    update: {},
    create: { id: "you", name: "You", email: "you@fantasy-mlp.local" },
  });

  // a few friend users for the league demo
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

  // teams
  for (const t of teams) {
    await prisma.team.upsert({ where: { id: t.id }, update: t, create: t });
  }

  // players
  for (const p of players) {
    await prisma.player.upsert({ where: { id: p.id }, update: p, create: p });
  }

  // events
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: { ...e, startsAt: new Date(e.startsAt), locksAt: new Date(e.locksAt), teamIds: e.teamIds.join(",") },
      create: { ...e, startsAt: new Date(e.startsAt), locksAt: new Date(e.locksAt), teamIds: e.teamIds.join(",") },
    });
  }

  // a starter league with all friends in it
  const league = await prisma.league.upsert({
    where: { id: "lg_pickle_pals" },
    update: {},
    create: {
      id: "lg_pickle_pals",
      name: "The Pickle Pals",
      commissionerId: "you",
    },
  });
  const allMembers = ["you", ...friends.map((f) => f.id)];
  for (const userId of allMembers) {
    await prisma.leagueMember.upsert({
      where: { leagueId_userId: { leagueId: league.id, userId } },
      update: {},
      create: { leagueId: league.id, userId, role: userId === "you" ? "commissioner" : "member" },
    });
  }

  // sample trash talk
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

  console.log("Seed complete.");
}

main().finally(() => prisma.$disconnect());
