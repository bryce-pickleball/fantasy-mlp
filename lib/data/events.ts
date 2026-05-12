import type { Event } from "../types";

// 2026 MLP season — source: majorleaguepickleball.co/events-2026/
// Lineups lock at 9 AM local time (~13:00 UTC for ET cities, ~14:00 UTC for CT)
// on the morning of the event's first day. For v0.1 we use 13:00 UTC universally —
// "morning of first serve" is approximate.
// First serve is typically Thursday afternoon for regular-season events.

// Mid-Season Tournament + Playoffs run longer (5 days); regular season is Thursday-Sunday.
type RawEvent = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD, in event's local timezone
  endDate: string;   // YYYY-MM-DD
  kind: "regular" | "mid-season" | "playoffs" | "finals";
};

const SCHEDULE: RawEvent[] = [
  { id: "mlp-2026-dallas",         name: "MLP Dallas",                startDate: "2026-05-22", endDate: "2026-05-25", kind: "regular" },
  { id: "mlp-2026-columbus",       name: "MLP Columbus",              startDate: "2026-05-28", endDate: "2026-05-31", kind: "regular" },
  { id: "mlp-2026-st-louis",       name: "MLP St. Louis",             startDate: "2026-06-04", endDate: "2026-06-07", kind: "regular" },
  { id: "mlp-2026-austin",         name: "MLP Austin",                startDate: "2026-06-11", endDate: "2026-06-14", kind: "regular" },
  { id: "mlp-2026-st-petersburg",  name: "MLP St. Petersburg",        startDate: "2026-06-17", endDate: "2026-06-21", kind: "regular" },
  { id: "mlp-2026-new-york",       name: "MLP New York — Randall's Island", startDate: "2026-06-25", endDate: "2026-06-28", kind: "regular" },
  { id: "mlp-2026-grand-rapids",   name: "MLP Grand Rapids Mid-Season", startDate: "2026-07-08", endDate: "2026-07-12", kind: "mid-season" },
  { id: "mlp-2026-san-diego",      name: "MLP San Diego",             startDate: "2026-07-16", endDate: "2026-07-19", kind: "regular" },
  { id: "mlp-2026-chicago",        name: "MLP Chicago",               startDate: "2026-07-23", endDate: "2026-07-26", kind: "regular" },
  { id: "mlp-2026-orlando",        name: "MLP Orlando — ESPN WWoS",   startDate: "2026-07-30", endDate: "2026-08-02", kind: "regular" },
  { id: "mlp-2026-playoffs-dallas",name: "MLP Playoffs — Dallas",     startDate: "2026-08-06", endDate: "2026-08-09", kind: "playoffs" },
  { id: "mlp-2026-newport-beach",  name: "MLP Playoffs — Newport Beach", startDate: "2026-08-13", endDate: "2026-08-16", kind: "playoffs" },
  { id: "mlp-2026-finals-nyc",     name: "MLP Finals — New York City", startDate: "2026-08-28", endDate: "2026-08-30", kind: "finals" },
];

// Helper: "2026-05-22" + "13:00:00Z" -> ISO timestamp
const at = (date: string, time: string) => `${date}T${time}Z`;

// Until we have per-event team groups from MLP, every event has all 20 teams.
const ALL_TEAM_IDS = [
  "atl","bay","bkn","cbb","car","chi","col","dal","fla","lv",
  "lam","mia","nj","orl","pb","phx","soc","stl","tx","uth",
];

export const events: Event[] = SCHEDULE.map((e) => ({
  id: e.id,
  name: e.name,
  startsAt: at(e.startDate, "17:00:00"), // ~1 PM ET first-serve estimate
  locksAt:  at(e.startDate, "13:00:00"), // 9 AM ET morning-of lock
  teamIds: ALL_TEAM_IDS,
}));
