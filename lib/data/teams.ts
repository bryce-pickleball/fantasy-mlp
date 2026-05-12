import type { Team } from "../types";

// 2026 MLP season — all 20 teams. Source: majorleaguepickleball.co
// Logos are local copies in public/teams/ — see scripts/team-logos.sh
const logo = (id: string, ext: "png" | "svg" = "png") => `/teams/${id}.${ext}`;

export const teams: Team[] = [
  { id: "atl", name: "Atlanta Bouncers",         abbr: "ATL", logoUrl: logo("atl") },
  { id: "bay", name: "Bay Area Breakers",        abbr: "BAY", logoUrl: logo("bay", "svg") },
  { id: "bkn", name: "Brooklyn Pickleball Team", abbr: "BKN", logoUrl: logo("bkn") },
  { id: "cbb", name: "California Black Bears",   abbr: "CBB", logoUrl: logo("cbb") },
  { id: "car", name: "Carolina Hogs",            abbr: "CAR", logoUrl: logo("car") },
  { id: "chi", name: "Chicago Slice",            abbr: "CHI", logoUrl: logo("chi") },
  { id: "col", name: "Columbus Sliders",         abbr: "COL", logoUrl: logo("col") },
  { id: "dal", name: "Dallas Flash",             abbr: "DAL", logoUrl: logo("dal") },
  { id: "fla", name: "Florida Smash",            abbr: "FLA", logoUrl: logo("fla") },
  { id: "lv",  name: "Las Vegas Night Owls",     abbr: "LV",  logoUrl: logo("lv", "svg") },
  { id: "lam", name: "Los Angeles Mad Drops",    abbr: "LAM", logoUrl: logo("lam", "svg") },
  { id: "mia", name: "Miami Pickleball Club",    abbr: "MIA", logoUrl: logo("mia") },
  { id: "nj",  name: "New Jersey 5s",            abbr: "NJ",  logoUrl: logo("nj") },
  { id: "orl", name: "Orlando Squeeze",          abbr: "ORL", logoUrl: logo("orl") },
  { id: "pb",  name: "Palm Beach Royals",        abbr: "PB",  logoUrl: logo("pb") },
  { id: "phx", name: "Phoenix Flames",           abbr: "PHX", logoUrl: logo("phx") },
  { id: "soc", name: "SoCal Hard Eights",        abbr: "SOC", logoUrl: logo("soc") },
  { id: "stl", name: "St. Louis Shock",          abbr: "STL", logoUrl: logo("stl") },
  { id: "tx",  name: "Texas Ranchers",           abbr: "TX",  logoUrl: logo("tx") },
  { id: "uth", name: "Utah Black Diamonds",      abbr: "UTH", logoUrl: logo("uth") },
];
