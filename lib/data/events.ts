import type { Event } from "../types";

const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();

export const events: Event[] = [
  {
    id: "evt-week-3",
    name: "MLP Week 3 — Atlanta",
    startsAt: inHours(6),
    locksAt: inHours(5),
    teamIds: ["atl", "bkn", "chi", "dal", "lv", "mia", "nj", "phx"],
  },
  {
    id: "evt-week-4",
    name: "MLP Week 4 — Daytona",
    startsAt: inHours(30),
    locksAt: inHours(29),
    teamIds: ["atl", "bkn", "chi", "dal", "lv", "mia", "nj", "phx"],
  },
];
