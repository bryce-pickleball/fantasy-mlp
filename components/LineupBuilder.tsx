"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Player, Team } from "@/lib/types";
import { LINEUP_MEN, LINEUP_WOMEN, SALARY_CAP } from "@/lib/types";
import { validateLineup } from "@/lib/scoring";

type Props = {
  eventId: string;
  players: Player[];
  teams: Team[];
  existingPlayerIds: string[];
};

type Filter = "ALL" | "M" | "W";

export default function LineupBuilder({ eventId, players, teams, existingPlayerIds }: Props) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set(existingPlayerIds));
  const [filter, setFilter] = useState<Filter>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);

  const totals = useMemo(() => {
    const ids = [...picked];
    const r = validateLineup(players, ids, SALARY_CAP);
    const men = players.filter((p) => picked.has(p.id) && p.gender === "M").length;
    const women = players.filter((p) => picked.has(p.id) && p.gender === "W").length;
    return { ...r, men, women, ids };
  }, [picked, players]);

  const filtered = useMemo(() => {
    return players
      .filter((p) => (filter === "ALL" ? true : p.gender === filter))
      .filter((p) => (teamFilter ? p.teamId === teamFilter : true))
      .sort((a, b) => b.salary - a.salary);
  }, [players, filter, teamFilter]);

  const toggle = (p: Player) => {
    setServerMsg(null);
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) {
        next.delete(p.id);
        return next;
      }
      const sameGender = [...next].filter((id) => players.find((x) => x.id === id)?.gender === p.gender).length;
      const limit = p.gender === "M" ? LINEUP_MEN : LINEUP_WOMEN;
      if (sameGender >= limit) {
        setServerMsg(`You already have ${limit} ${p.gender === "M" ? "men" : "women"}. Drop one first.`);
        return prev;
      }
      next.add(p.id);
      return next;
    });
  };

  async function submit() {
    setSubmitting(true);
    setServerMsg(null);
    try {
      const res = await fetch("/api/lineup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, playerIds: totals.ids }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerMsg(json.errors?.join(" ") ?? "Submission failed.");
      } else {
        setServerMsg("Lineup submitted. See you on the court.");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const capRatio = Math.min(1, totals.total / SALARY_CAP);
  const overCap = totals.total > SALARY_CAP;
  const remaining = SALARY_CAP - totals.total;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <section className="panel p-4">
        <header className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Player pool</h2>
          <div className="flex items-center gap-2 text-sm">
            {(["ALL", "M", "W"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full border ${filter === f ? "bg-ink text-paper border-ink" : "border-line hover:border-ink/40"}`}
              >
                {f === "ALL" ? "All" : f === "M" ? "Men" : "Women"}
              </button>
            ))}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-1 rounded-full border border-line bg-white"
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.abbr}</option>
              ))}
            </select>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((p) => {
            const sel = picked.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p)}
                className={`flex items-center justify-between text-left p-3 rounded border transition ${
                  sel ? "bg-court text-paper border-court" : "bg-white border-line hover:border-ink/30"
                }`}
              >
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className={`text-xs ${sel ? "text-paper/80" : "text-ink/60"}`}>
                    {teamById[p.teamId]?.abbr} · {p.gender} · rtg <span className="num">{p.rating}</span>
                  </span>
                </span>
                <span className="num font-mono font-semibold">${p.salary.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="panel p-4">
          <h2 className="font-display text-xl font-semibold mb-3">Your lineup</h2>
          <div className="flex items-center justify-between text-xs text-ink/60 mb-1 num">
            <span>${totals.total.toLocaleString()} / ${SALARY_CAP.toLocaleString()}</span>
            <span>{overCap ? `Over by $${(totals.total - SALARY_CAP).toLocaleString()}` : `$${remaining.toLocaleString()} left`}</span>
          </div>
          <div className={`meter ${overCap ? "over" : ""}`}>
            <span style={{ width: `${capRatio * 100}%` }} />
          </div>

          <div className="flex justify-between mt-4 mb-1 text-xs text-ink/60">
            <span>Men <span className="num">{totals.men}/{LINEUP_MEN}</span></span>
            <span>Women <span className="num">{totals.women}/{LINEUP_WOMEN}</span></span>
          </div>

          <ul className="mt-2 divide-y divide-line text-sm">
            {totals.ids.length === 0 && (
              <li className="py-3 text-ink/50 font-serif italic">No picks yet. Tap a player.</li>
            )}
            {totals.ids.map((id) => {
              const p = players.find((x) => x.id === id)!;
              return (
                <li key={id} className="py-2 flex items-center justify-between">
                  <span>
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-ink/50 text-xs"> · {teamById[p.teamId]?.abbr} · {p.gender}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="num font-mono">${p.salary.toLocaleString()}</span>
                    <button onClick={() => toggle(p)} className="text-ink/50 hover:text-accent" aria-label="remove">✕</button>
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            onClick={submit}
            disabled={!totals.ok || submitting}
            className="mt-4 w-full py-2 rounded font-display font-semibold bg-ink text-paper disabled:bg-line disabled:text-ink/40"
          >
            {submitting ? "Submitting…" : totals.ok ? "Submit lineup" : "Fill out your lineup"}
          </button>

          {!totals.ok && totals.errors.length > 0 && (
            <ul className="mt-3 text-xs text-accent space-y-1">
              {totals.errors.map((e) => <li key={e}>· {e}</li>)}
            </ul>
          )}
          {serverMsg && <p className="mt-3 text-sm font-serif italic">{serverMsg}</p>}
        </div>

        <div className="panel p-4 text-sm">
          <h3 className="font-display font-semibold mb-2">The Magnificent Six</h3>
          <p className="text-ink/70 font-serif italic mb-2">
            Pick three men and three women. Salary cap ${SALARY_CAP.toLocaleString()}. Lineups lock at first serve.
          </p>
          <ul className="text-xs text-ink/60 space-y-0.5 num">
            <li>Rally point · +0.5</li>
            <li>Winner · +1.0</li>
            <li>Ace · +1.5</li>
            <li>Unforced error · −0.5</li>
            <li>Game win · +5</li>
            <li>Dreambreaker win · +8</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
