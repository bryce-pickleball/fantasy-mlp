import type { GameStat, LineupScore, MatchResult, Player, PlayerScore } from "./types";

const POINTS_PER_RALLY = 0.5;
const POINTS_PER_WINNER = 1.0;
const POINTS_PER_ACE = 1.5;
const POINTS_PER_ERROR = -0.5;
const BONUS_GAME_WIN = 5;
const BONUS_DREAMBREAKER_WIN = 8;

export function scoreGame(stat: GameStat): PlayerScore {
  const breakdown: PlayerScore["breakdown"] = [];
  const pointsRaw = stat.points * POINTS_PER_RALLY;
  if (pointsRaw) breakdown.push({ label: `${stat.points} rally pts`, value: round(pointsRaw) });
  const winners = stat.winners * POINTS_PER_WINNER;
  if (winners) breakdown.push({ label: `${stat.winners} winners`, value: round(winners) });
  const aces = stat.aces * POINTS_PER_ACE;
  if (aces) breakdown.push({ label: `${stat.aces} aces`, value: round(aces) });
  const errors = stat.errors * POINTS_PER_ERROR;
  if (errors) breakdown.push({ label: `${stat.errors} errors`, value: round(errors) });
  if (stat.won) breakdown.push({ label: "game win", value: BONUS_GAME_WIN });
  if (stat.dreambreakerWon) breakdown.push({ label: "dreambreaker win", value: BONUS_DREAMBREAKER_WIN });
  const total = round(breakdown.reduce((s, b) => s + b.value, 0));
  return { playerId: stat.playerId, total, breakdown };
}

export function scoreMatch(result: MatchResult): PlayerScore[] {
  const byPlayer = new Map<string, PlayerScore>();
  for (const stat of result.stats) {
    const game = scoreGame(stat);
    const prior = byPlayer.get(stat.playerId);
    if (!prior) {
      byPlayer.set(stat.playerId, game);
    } else {
      byPlayer.set(stat.playerId, {
        playerId: stat.playerId,
        total: round(prior.total + game.total),
        breakdown: [...prior.breakdown, ...game.breakdown],
      });
    }
  }
  return [...byPlayer.values()];
}

export function scoreLineup(
  eventId: string,
  ownerId: string,
  playerIds: string[],
  results: MatchResult[],
): LineupScore {
  const perPlayer: PlayerScore[] = playerIds.map((playerId) => {
    const merged: PlayerScore = { playerId, total: 0, breakdown: [] };
    for (const r of results) {
      for (const ps of scoreMatch(r)) {
        if (ps.playerId !== playerId) continue;
        merged.total = round(merged.total + ps.total);
        merged.breakdown.push(...ps.breakdown);
      }
    }
    return merged;
  });
  const total = round(perPlayer.reduce((s, p) => s + p.total, 0));
  return { eventId, ownerId, total, perPlayer };
}

export function validateLineup(players: Player[], lineupPlayerIds: string[], cap: number) {
  const errors: string[] = [];
  if (lineupPlayerIds.length !== 6) errors.push(`Lineup must have 6 players (you have ${lineupPlayerIds.length}).`);
  const set = new Set(lineupPlayerIds);
  if (set.size !== lineupPlayerIds.length) errors.push("No duplicate players.");
  const picked = players.filter((p) => set.has(p.id));
  const men = picked.filter((p) => p.gender === "M").length;
  const women = picked.filter((p) => p.gender === "W").length;
  if (men !== 3) errors.push(`Need exactly 3 men (you have ${men}).`);
  if (women !== 3) errors.push(`Need exactly 3 women (you have ${women}).`);
  const total = picked.reduce((s, p) => s + p.salary, 0);
  if (total > cap) errors.push(`Over cap by $${(total - cap).toLocaleString()}.`);
  return { ok: errors.length === 0, errors, total };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
