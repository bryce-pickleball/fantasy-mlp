"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLeagueForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Failed to create.");
        return;
      }
      router.push(`/leagues/${json.leagueId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel p-6 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">League name</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Pickle Pals"
          className="mt-1 w-full px-3 py-2 rounded border border-line bg-white font-display text-xl"
          maxLength={60}
        />
      </label>
      <div className="flex items-center justify-between">
        <p className="text-xs font-serif italic text-ink/60">Pick something your group will recognize on a phone notification.</p>
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="font-display font-semibold px-4 py-2 rounded bg-ink text-paper disabled:bg-line disabled:text-ink/40"
        >
          {busy ? "Creating…" : "Create league"}
        </button>
      </div>
      {err && <p className="text-sm text-accent">{err}</p>}
    </form>
  );
}
