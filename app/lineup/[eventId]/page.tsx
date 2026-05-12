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
  const locked = new Date(event.locksAt) <= new Date();
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <div className="text-sm font-serif italic text-court flex items-center gap-2">
          {new Date(event.startsAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          {locked && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-display font-semibold bg-accent text-paper">
              Locked
            </span>
          )}
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight">{event.name}</h1>
        <p className="text-sm text-ink/60 num mt-1">
          {locked
            ? <>Locked at {new Date(event.locksAt).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</>
            : <>Lineups lock {new Date(event.locksAt).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</>
          }
        </p>
      </header>
      <LineupBuilder
        eventId={event.id}
        players={players}
        teams={teams}
        existingPlayerIds={existing?.playerIds ?? []}
        locksAt={event.locksAt}
      />
    </main>
  );
}
