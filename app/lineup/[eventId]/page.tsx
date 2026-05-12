import { notFound } from "next/navigation";
import LineupBuilder from "@/components/LineupBuilder";
import { data } from "@/lib/data/adapter";
import { getCurrentUser } from "@/lib/currentUser";

export default async function LineupPage({ params }: { params: { eventId: string } }) {
  const event = await data.getEvent(params.eventId);
  if (!event) notFound();
  const me = await getCurrentUser();
  const players = await data.getPlayersForEvent(event.id);
  const teams = await data.getTeams();
  const existing = await data.getLineup(event.id, me.id);
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="text-sm font-serif italic text-court">{new Date(event.startsAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight">{event.name}</h1>
        <p className="text-sm text-ink/60 num mt-1">
          Lineups lock {new Date(event.locksAt).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
        </p>
      </header>
      <LineupBuilder
        eventId={event.id}
        players={players}
        teams={teams}
        existingPlayerIds={existing?.playerIds ?? []}
      />
    </main>
  );
}
