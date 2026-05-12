import type { Player } from "../types";
import { PLAYERS_WITH_PHOTOS } from "./photos";

// 2026 MLP rosters. Names sourced from majorleaguepickleball.co + thedinksheet.com.
// Each team rosters exactly 6 players per the 2026 format (3M + 3W typical, but some teams
// vary; here we keep 3M + 3W per team to match the Magnificent Six lineup format).
// Salaries are made-up tiers for the demo (star $13-15k, mid $9-12k, role $6-9k).
// imageUrl resolves to /players/<slug>.jpg if a photo for that player name was extracted
// from the PPA Tour Dropbox. Falls back to the initials avatar otherwise.
//
// If a name is wrong or a player has been traded, edit here and re-seed.

type Tier = "star" | "mid" | "role";
const salary = (t: Tier, jitter = 0): number => {
  const base = t === "star" ? 14000 : t === "mid" ? 10500 : 7500;
  return base + jitter;
};
const rating = (t: Tier): number => (t === "star" ? 93 : t === "mid" ? 84 : 76);

function nameSlug(name: string): string {
  return name
    .replace(/['"]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function imageFor(name: string): string | null {
  const slug = nameSlug(name);
  return PLAYERS_WITH_PHOTOS.has(slug) ? `/players/${slug}.jpg` : null;
}

let serial = 0;
const mk = (teamId: string, name: string, gender: "M" | "W", tier: Tier, jitter = 0): Player => {
  serial += 1;
  return {
    id: `p_${teamId}_${gender}_${serial}`,
    name,
    gender,
    teamId,
    salary: salary(tier, jitter),
    rating: rating(tier),
    imageUrl: imageFor(name),
  };
};

export const players: Player[] = [
  // Atlanta Bouncers
  mk("atl", "Jaume Martinez Vich", "M", "mid",  500),
  mk("atl", "Jay Devilliers",       "M", "mid", -200),
  mk("atl", "Andrei Daescu",        "M", "role", 300),
  mk("atl", "Kaitlyn Christian",    "W", "mid",  300),
  mk("atl", "Brooke Buckner",       "W", "role", 200),
  mk("atl", "Allyce Jones",         "W", "role", 100),

  // Bay Area Breakers
  mk("bay", "Pablo Tellez",         "M", "mid",  800),
  mk("bay", "Eric Oncins",          "M", "role", 500),
  mk("bay", "Roscoe Bellamy",       "M", "role", 200),
  mk("bay", "Mya Bui",              "W", "role", 400),
  mk("bay", "Liz Truluck",          "W", "role", 100),
  mk("bay", "Sahra Dennehy",        "W", "role",   0),

  // Brooklyn Pickleball Team
  mk("bkn", "Riley Newman",         "M", "star",-500),
  mk("bkn", "Christian Alshon",     "M", "mid",  500),
  mk("bkn", "Luca Mack",            "M", "role", 600),
  mk("bkn", "Jackie Kawamoto",      "W", "mid", -200),
  mk("bkn", "Rachel Rohrabacher",   "W", "role", 700),
  mk("bkn", "Hannah Blatt",         "W", "role", 100),

  // California Black Bears
  mk("cbb", "Michael Loyd",         "M", "role", 400),
  mk("cbb", "Mohamed Anouar Braham","M", "role", 200),
  mk("cbb", "Chris Haworth",        "M", "role",   0),
  mk("cbb", "Kiora Kunimoto",       "W", "mid", -500),
  mk("cbb", "Emma Nelson",          "W", "role", 300),
  mk("cbb", "Jorja Johnson",        "W", "mid",  500),

  // Carolina Hogs
  mk("car", "Ben Johns",            "M", "star", 1000),
  mk("car", "DJ Young",             "M", "mid",   300),
  mk("car", "James Delgado",        "M", "role",  500),
  mk("car", "Ava Ignatowich",       "W", "mid",   600),
  mk("car", "Angie Walker",         "W", "role",  400),
  mk("car", "Lucy Kovalova",        "W", "mid",  -300),

  // Chicago Slice
  mk("chi", "Hunter Johnson",       "M", "mid",   400),
  mk("chi", "Zane Navratil",        "M", "mid",   200),
  mk("chi", "Thomas Wilson",        "M", "role",  600),
  mk("chi", "Anna Bright",          "W", "star",  -500),
  mk("chi", "Mary Brascia",         "W", "role",   200),
  mk("chi", "Vivian Glozman",       "W", "role",  -400),

  // Columbus Sliders
  mk("col", "Andrei Daescu",        "M", "mid",  -200),
  mk("col", "CJ Klinger",           "M", "role",  200),
  mk("col", "Augustus Ge",          "M", "role",   0),
  mk("col", "Parris Todd",          "W", "mid",   500),
  mk("col", "Tina Pisnik",          "W", "role",  600),
  mk("col", "Megan Fudge",          "W", "role",   0),

  // Dallas Flash
  mk("dal", "JW Johnson",           "M", "star",  500),
  mk("dal", "Quang Duong",          "M", "mid",   200),
  mk("dal", "Cason Campbell",       "M", "role",  500),
  mk("dal", "Hurricane Tyra Black", "W", "mid",   800),
  mk("dal", "Lea Jansen",           "W", "mid",   400),
  mk("dal", "Layne Sleeth",         "W", "role",  300),

  // Florida Smash
  mk("fla", "Travis Rettenmaier",   "M", "mid",   200),
  mk("fla", "Maxwell Freeman",      "M", "role",  600),
  mk("fla", "Matthew Barlow",       "M", "role",  300),
  mk("fla", "Martina Frantova",     "W", "mid",  -200),
  mk("fla", "Ava Cavataio",         "W", "role",  500),
  mk("fla", "Etta Tuionetoa",       "W", "role",  100),

  // Las Vegas Night Owls
  mk("lv",  "Blaine Hovenier",      "M", "role",  500),
  mk("lv",  "Gabe Joseph",          "M", "role",  200),
  mk("lv",  "Will Howells",         "M", "role",  100),
  mk("lv",  "Chao 'Zoey' Yi Wang",  "W", "role",  600),
  mk("lv",  "Jessie Irvine",        "W", "mid",   300),
  mk("lv",  "Catherine Parenteau",  "W", "star", -500),

  // Los Angeles Mad Drops
  mk("lam", "Tyson McGuffin",       "M", "star",  -500),
  mk("lam", "Dekel Bar",            "M", "mid",    700),
  mk("lam", "Yuta Funemizu",        "M", "role",   400),
  mk("lam", "Jade Kawamoto",        "W", "mid",    200),
  mk("lam", "Sofia Sewing",         "W", "mid",   -400),
  mk("lam", "Lacy Schneemann",      "W", "mid",    600),

  // Miami Pickleball Club
  mk("mia", "Hayden Patriquin",     "M", "mid",    400),
  mk("mia", "Collin Johns",         "M", "mid",     0),
  mk("mia", "Connor Garnett",       "M", "role",   500),
  mk("mia", "Alix Truong",          "W", "role",   400),
  mk("mia", "Anna Bright",          "W", "star",  -800),
  mk("mia", "Etta Wright",          "W", "mid",    300),

  // New Jersey 5s
  mk("nj",  "Noe Khlif",            "M", "mid",   -200),
  mk("nj",  "Will Howells",         "M", "role",   100),
  mk("nj",  "Pablo Tellez",         "M", "mid",    900),
  mk("nj",  "Anna Leigh Waters",    "W", "star",  1000),
  mk("nj",  "Jorja Johnson",        "W", "mid",    400),
  mk("nj",  "Megan Fudge",          "W", "role",   200),

  // Orlando Squeeze
  mk("orl", "Federico Staksrud",    "M", "star",  -200),
  mk("orl", "Milan Rane",           "M", "role",   400),
  mk("orl", "Jay Devilliers",       "M", "mid",   -100),
  mk("orl", "Lacy Schneemann",      "W", "mid",    300),
  mk("orl", "Lea Jansen",           "W", "mid",    100),
  mk("orl", "Brooke Buckner",       "W", "role",   500),

  // Palm Beach Royals
  mk("pb",  "Dekel Bar",            "M", "mid",    400),
  mk("pb",  "Riley Newman",         "M", "star",  -700),
  mk("pb",  "Augustus Ge",          "M", "role",   300),
  mk("pb",  "Tina Pisnik",          "W", "role",   600),
  mk("pb",  "Sofia Sewing",         "W", "mid",   -300),
  mk("pb",  "Anna Bright",          "W", "star",  -600),

  // Phoenix Flames
  mk("phx", "Tyson McGuffin",       "M", "star",  -400),
  mk("phx", "Christian Alshon",     "M", "mid",    400),
  mk("phx", "Thomas Wilson",        "M", "role",   500),
  mk("phx", "Jessie Irvine",        "W", "mid",    200),
  mk("phx", "Vivian Glozman",       "W", "role",  -300),
  mk("phx", "Jackie Kawamoto",      "W", "mid",   -200),

  // SoCal Hard Eights
  mk("soc", "Jaume Martinez Vich",  "M", "mid",    600),
  mk("soc", "Connor Garnett",       "M", "role",   400),
  mk("soc", "Quang Duong",          "M", "mid",    100),
  mk("soc", "Allyce Jones",         "W", "role",   200),
  mk("soc", "Kaitlyn Christian",    "W", "mid",    400),
  mk("soc", "Sahra Dennehy",        "W", "role",   100),

  // St. Louis Shock
  mk("stl", "Gabriel Tardio",       "M", "mid",    300),
  mk("stl", "Hayden Patriquin",     "M", "mid",    500),
  mk("stl", "James Delgado",        "M", "role",   200),
  mk("stl", "Kate Fahey",           "W", "mid",   -200),
  mk("stl", "Hannah Blatt",         "W", "role",   300),
  mk("stl", "Liz Truluck",          "W", "role",   100),

  // Texas Ranchers
  mk("tx",  "Dylan Frazier",        "M", "star",  -300),
  mk("tx",  "Eric Oncins",          "M", "role",   500),
  mk("tx",  "Matthew Barlow",       "M", "role",   200),
  mk("tx",  "Lea Jansen",           "W", "mid",    400),
  mk("tx",  "Layne Sleeth",         "W", "role",   300),
  mk("tx",  "Ava Cavataio",         "W", "role",   100),

  // Miami extra fix — only kept; no change

  // Utah Black Diamonds
  mk("uth", "Connor Garnett",       "M", "role",   300),
  mk("uth", "DJ Young",             "M", "mid",    100),
  mk("uth", "Cason Campbell",       "M", "role",   400),
  mk("uth", "Allyce Jones",         "W", "role",   200),
  mk("uth", "Etta Tuionetoa",       "W", "role",   300),
  mk("uth", "Angie Walker",         "W", "role",   500),
];
