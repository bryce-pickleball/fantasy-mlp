"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  author: { id: string; name: string };
  body: string;
  createdAt: string;
};

export default function LeagueChat({
  leagueId,
  currentUserId,
  initial,
}: {
  leagueId: string;
  currentUserId: string;
  initial: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sinceRef = useRef<string>(initial.at(-1)?.createdAt ?? new Date(0).toISOString());

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/leagues/${leagueId}/messages?since=${encodeURIComponent(sinceRef.current)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as { ok: boolean; messages: Msg[] };
      if (json.messages.length > 0) {
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of json.messages) {
            if (!seen.has(m.id)) merged.push(m);
          }
          return merged;
        });
        sinceRef.current = json.messages.at(-1)!.createdAt;
      }
    } catch {
      /* ignore */
    }
  }, [leagueId]);

  useEffect(() => {
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setDraft("");
    try {
      const res = await fetch(`/api/leagues/${leagueId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json();
      if (res.ok && json.message) {
        setMessages((prev) => [...prev, json.message]);
        sinceRef.current = json.message.createdAt;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <header className="px-4 py-3 border-b border-line">
        <h2 className="font-display text-lg font-semibold">Trash talk</h2>
      </header>
      <div ref={scrollerRef} className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 bg-paper/40">
        {messages.length === 0 && (
          <p className="text-sm font-serif italic text-ink/50">Quiet for now. Say something.</p>
        )}
        {messages.map((m) => {
          const mine = m.author.id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                <span className="text-xs text-ink/50">
                  {mine ? "You" : m.author.name} · <span className="num">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
                <span className={`mt-0.5 px-3 py-2 rounded-2xl text-sm ${mine ? "bg-ink text-paper rounded-br-sm" : "bg-white border border-line rounded-bl-sm"}`}>
                  {m.body}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="border-t border-line p-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="say something…"
          className="flex-1 px-3 py-2 rounded border border-line bg-white"
        />
        <button
          type="submit"
          disabled={!draft.trim() || busy}
          className="px-4 py-2 rounded font-display font-semibold bg-ink text-paper disabled:bg-line disabled:text-ink/40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
