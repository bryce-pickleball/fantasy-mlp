import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { data } from "@/lib/data/adapter";
import { getCurrentUser } from "@/lib/currentUser";
import LeagueChat from "./LeagueChat";
import InviteButton from "./InviteButton";

export default async function LeagueDetailPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  const league = await prisma.league.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: "asc" } },
      commissioner: { select: { id: true, name: true } },
    },
  });
  if (!league) notFound();

  const myMembership = league.members.find((m) => m.userId === me.id);
  const events = await prisma.event.findMany({ orderBy: { startsAt: "asc" } });
  // Focus the next non-locked event; fall back to the most recent if season's done.
  const now = Date.now();
  const focusEvent = events.find((e) => e.locksAt.getTime() > now) ?? events.at(-1);

  const memberIds = new Set(league.members.map((m) => m.userId));
  const board = focusEvent ? (await data.getLeaderboard(focusEvent.id)).filter((s) => memberIds.has(s.ownerId)) : [];
  const userById = Object.fromEntries(league.members.map((m) => [m.user.id, m.user.name]));

  const messages = await prisma.leagueMessage.findMany({
    where: { leagueId: league.id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 grid lg:grid-cols-[1fr_360px] gap-8">
      <section>
        <header className="mb-6">
          <p className="font-serif italic text-court text-sm">
            {myMembership?.role === "commissioner" ? "You're the commissioner." : "You're in this league."}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{league.name}</h1>
          <p className="text-sm text-ink/60 font-serif italic">
            {league.members.length} member{league.members.length === 1 ? "" : "s"} · run by {league.commissioner.name}
          </p>
        </header>

        {focusEvent && (
          <div className="panel p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-serif italic text-court"><span className="live-dot" />Standings · {focusEvent.name}</p>
              </div>
              <Link href={`/lineup/${focusEvent.id}`} className="text-sm text-accent font-display font-semibold">
                Set your lineup →
              </Link>
            </div>
            <ol className="divide-y divide-line">
              {board.length === 0 ? (
                <li className="py-3 font-serif italic text-ink/50">No lineups submitted yet. Be the first.</li>
              ) : (
                board.map((row, i) => (
                  <li key={row.ownerId} className="py-3 flex items-center justify-between">
                    <span className="flex items-center gap-4">
                      <span className="num font-mono text-ink/40 w-6 text-right">{i + 1}</span>
                      <span className="font-semibold">
                        {row.ownerId === me.id ? "You" : userById[row.ownerId] ?? row.ownerId}
                      </span>
                    </span>
                    <span className="num font-mono font-semibold">{row.total.toFixed(1)}</span>
                  </li>
                ))
              )}
            </ol>
          </div>
        )}

        <LeagueChat
          leagueId={league.id}
          currentUserId={me.id}
          initial={messages.map((m) => ({
            id: m.id,
            author: m.author,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </section>

      <aside className="space-y-4">
        <div className="panel p-4">
          <h2 className="font-display text-lg font-semibold mb-3">Members</h2>
          <ul className="text-sm divide-y divide-line">
            {league.members.map((m) => (
              <li key={m.userId} className="py-2 flex items-center justify-between">
                <span className="font-semibold">{m.userId === me.id ? "You" : m.user.name}</span>
                <span className="text-xs text-ink/50">{m.role === "commissioner" ? "commish" : "member"}</span>
              </li>
            ))}
          </ul>
        </div>

        {myMembership && <InviteButton leagueId={league.id} />}
      </aside>
    </main>
  );
}
