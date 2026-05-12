"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClient({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function join() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/join/${token}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(json.error ?? "Couldn't join.");
        return;
      }
      router.push(`/leagues/${json.leagueId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel p-6 space-y-4">
      <p className="font-serif italic text-ink/70">
        Tap to accept. You'll land in the league and can set your lineup for the next event.
      </p>
      <button
        onClick={join}
        disabled={busy}
        className="w-full font-display font-semibold px-4 py-3 rounded bg-ink text-paper disabled:bg-line"
      >
        {busy ? "Joining…" : "Join league"}
      </button>
      {err && <p className="text-sm text-accent">{err}</p>}
      <p className="text-xs text-ink/50 font-serif italic">
        Tip: use the user-switcher up top to simulate being a different friend before clicking this — that's how you demo the multi-player flow without real auth.
      </p>
    </div>
  );
}
