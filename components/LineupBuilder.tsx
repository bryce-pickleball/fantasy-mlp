"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Player, Team } from "@/lib/types";
import { LINEUP_MEN, LINEUP_WOMEN, SALARY_CAP } from "@/lib/types";
import { validateLineup } from "@/lib/scoring";
import Avatar from "./Avatar";

type Props = {
  eventId: string;
  players: Player[];
  teams: Team[];
  existingPlayerIds: string[];
};

type Filter = "ALL" | "M" | "W";

export default function LineupBuilder({ eventId, players, teams, existingPlayerIds }: Props) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(existingPlayerIds);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const playerById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const teamById = useMemo(() => Object.fromEntries(teams.map((t) => [t.id, t])), [teams]);

  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const pickedPlayers = useMemo(
    () => picked.map((id) => playerById[id]).filter(Boolean) as Player[],
    [picked, playerById],
  );
  const men = pickedPlayers.filter((p) => p.gender === "M");
  const women = pickedPlayers.filter((p) => p.gender === "W");
  const totalSalary = pickedPlayers.reduce((s, p) => s + p.salary, 0);

  const v = useMemo(() => validateLineup(players, picked, SALARY_CAP), [players, picked]);

  // Build 6 ordered slots: 3 men then 3 women.
  const slots: { gender: "M" | "W"; index: number; player: Player | null }[] = useMemo(() => {
    const out: { gender: "M" | "W"; index: number; player: Player | null }[] = [];
    for (let i = 0; i < LINEUP_MEN; i++) out.push({ gender: "M", index: i, player: men[i] ?? null });
    for (let i = 0; i < LINEUP_WOMEN; i++) out.push({ gender: "W", index: i, player: women[i] ?? null });
    return out;
  }, [men, women]);

  const filtered = useMemo(() => {
    return players
      .filter((p) => (filter === "ALL" ? true : p.gender === filter))
      .filter((p) => (teamFilter ? p.teamId === teamFilter : true))
      .sort((a, b) => b.salary - a.salary);
  }, [players, filter, teamFilter]);

  function add(p: Player) {
    setServerMsg(null);
    const sameGenderCount = p.gender === "M" ? men.length : women.length;
    const limit = p.gender === "M" ? LINEUP_MEN : LINEUP_WOMEN;
    if (sameGenderCount >= limit) {
      setServerMsg(`Already at ${limit} ${p.gender === "M" ? "men" : "women"}. Drop one first.`);
      return;
    }
    setPicked((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
  }

  function remove(playerId: string) {
    setServerMsg(null);
    setPicked((prev) => prev.filter((id) => id !== playerId));
  }

  function toggle(p: Player) {
    pickedSet.has(p.id) ? remove(p.id) : add(p);
  }

  async function submit() {
    setSubmitting(true);
    setServerMsg(null);
    try {
      const res = await fetch("/api/lineup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, playerIds: picked }),
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

  // ---- status messaging ----------------------------------------------------
  const overCap = totalSalary > SALARY_CAP;
  const capLeft = SALARY_CAP - totalSalary;
  const capRatio = Math.min(1, totalSalary / SALARY_CAP);

  const needMen = Math.max(0, LINEUP_MEN - men.length);
  const needWomen = Math.max(0, LINEUP_WOMEN - women.length);

  // ONE actionable status message, in priority order.
  let status: { tone: "ok" | "warn" | "err"; text: string };
  if (overCap) {
    status = { tone: "err", text: `Over cap by $${(totalSalary - SALARY_CAP).toLocaleString()} — drop someone.` };
  } else if (needMen > 0 && needWomen > 0) {
    status = { tone: "warn", text: `Need ${needMen} more ${needMen === 1 ? "man" : "men"} and ${needWomen} more ${needWomen === 1 ? "woman" : "women"}.` };
  } else if (needMen > 0) {
    status = { tone: "warn", text: `Need ${needMen} more ${needMen === 1 ? "man" : "men"}.` };
  } else if (needWomen > 0) {
    status = { tone: "warn", text: `Need ${needWomen} more ${needWomen === 1 ? "woman" : "women"}.` };
  } else {
    status = { tone: "ok", text: `Ready. $${capLeft.toLocaleString()} under cap.` };
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      {/* ───────────────── PLAYER POOL ───────────────── */}
      <section className="panel p-4">
        <header className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-display text-xl font-semibold">Player pool <span className="text-ink/40 num font-mono text-sm">({filtered.length})</span></h2>
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
            const sel = pickedSet.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p)}
                className={`flex items-center gap-3 text-left p-2.5 rounded border transition ${
                  sel ? "bg-court text-paper border-court" : "bg-white border-line hover:border-ink/30"
                }`}
              >
                <Avatar name={p.name} imageUrl={p.imageUrl} size={36} gender={p.gender} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold truncate">{p.name}</span>
                  <span className={`text-xs ${sel ? "text-paper/80" : "text-ink/60"}`}>
                    {teamById[p.teamId]?.abbr} · {p.gender} · rtg <span className="num">{p.rating}</span>
                  </span>
                </span>
                <span className="num font-mono font-semibold whitespace-nowrap">${p.salary.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ───────────────── YOUR LINEUP ───────────────── */}
      <aside className="space-y-4">
        <div className="panel p-4">
          <h2 className="font-display text-xl font-semibold mb-3">Your lineup</h2>

          {/* salary meter */}
          <div className="flex items-center justify-between text-xs text-ink/60 mb-1 num">
            <span>${totalSalary.toLocaleString()} / ${SALARY_CAP.toLocaleString()}</span>
            <span>{overCap ? `Over by $${(totalSalary - SALARY_CAP).toLocaleString()}` : `$${capLeft.toLocaleString()} left`}</span>
          </div>
          <div className={`meter ${overCap ? "over" : ""}`}>
            <span style={{ width: `${capRatio * 100}%` }} />
          </div>

          {/* gender counters as bigger affordances */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className={`rounded border px-2 py-1.5 flex items-center justify-between ${needMen > 0 ? "border-accent/40 bg-accent/5 text-accent" : "border-court/40 bg-court/5 text-court"}`}>
              <span className="font-display font-semibold">Men</span>
              <span className="num font-mono">{men.length} / {LINEUP_MEN}</span>
            </div>
            <div className={`rounded border px-2 py-1.5 flex items-center justify-between ${needWomen > 0 ? "border-accent/40 bg-accent/5 text-accent" : "border-court/40 bg-court/5 text-court"}`}>
              <span className="font-display font-semibold">Women</span>
              <span className="num font-mono">{women.length} / {LINEUP_WOMEN}</span>
            </div>
          </div>

          {/* slot list — placeholders make the missing picks obvious */}
          <ul className="mt-3 space-y-1.5">
            {slots.map((slot, i) => {
              const p = slot.player;
              const role = slot.gender === "M" ? "Man" : "Woman";
              const slotKey = `${slot.gender}${slot.index}`;
              if (!p) {
                return (
                  <li
                    key={slotKey}
                    className="flex items-center gap-2 p-2 rounded border border-dashed border-line bg-paper/40"
                  >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-line/60 text-ink/40 font-display">+</span>
                    <span className="flex-1 text-sm text-ink/50 font-serif italic">
                      Pick a {role.toLowerCase()} <span className="num font-mono not-italic text-ink/30">#{slot.index + 1}</span>
                    </span>
                    <span className="text-xs text-ink/30 num font-mono w-6 text-right">{i + 1}</span>
                  </li>
                );
              }
              return (
                <li
                  key={slotKey}
                  className="flex items-center gap-2 p-2 rounded border border-line bg-white"
                >
                  <Avatar name={p.name} imageUrl={p.imageUrl} size={36} gender={p.gender} />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{p.name}</span>
                    <span className="text-xs text-ink/50">
                      {teamById[p.teamId]?.abbr} · {p.gender}
                    </span>
                  </span>
                  <span className="num font-mono text-sm">${p.salary.toLocaleString()}</span>
                  <button onClick={() => remove(p.id)} className="text-ink/40 hover:text-accent px-1" aria-label={`Remove ${p.name}`}>✕</button>
                </li>
              );
            })}
          </ul>

          {/* status line + submit */}
          <div className={`mt-4 text-sm font-display font-semibold ${
            status.tone === "ok" ? "text-court" : status.tone === "err" ? "text-accent" : "text-ink/70"
          }`}>
            {status.text}
          </div>

          <button
            onClick={submit}
            disabled={!v.ok || submitting}
            className="mt-2 w-full py-2 rounded font-display font-semibold bg-ink text-paper disabled:bg-line disabled:text-ink/40"
          >
            {submitting ? "Submitting…" : v.ok ? "Submit lineup" : "Fix the highlighted issues"}
          </button>

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
