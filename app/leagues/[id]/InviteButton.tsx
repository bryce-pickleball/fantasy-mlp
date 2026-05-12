"use client";

import { useState } from "react";

export default function InviteButton({ leagueId }: { leagueId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setCopied(false);
    try {
      const res = await fetch(`/api/leagues/${leagueId}/invite`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.token) setToken(json.token);
    } finally {
      setBusy(false);
    }
  }

  const url = token ? `${typeof window === "undefined" ? "" : window.location.origin}/join/${token}` : null;

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="panel p-4">
      <h2 className="font-display text-lg font-semibold mb-2">Invite friends</h2>
      <p className="text-xs font-serif italic text-ink/60 mb-3">
        One link. Text it, Slack it, whatever. Expires in 7 days.
      </p>
      {!token ? (
        <button
          onClick={generate}
          disabled={busy}
          className="w-full px-4 py-2 rounded font-display font-semibold bg-ink text-paper disabled:bg-line"
        >
          {busy ? "Generating…" : "Generate invite link"}
        </button>
      ) : (
        <div className="space-y-2">
          <input
            readOnly
            value={url ?? ""}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full px-2 py-2 rounded border border-line bg-white text-xs font-mono"
          />
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 px-3 py-2 rounded font-display font-semibold bg-court text-paper">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={generate} className="px-3 py-2 rounded font-display font-semibold border border-line">
              New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
