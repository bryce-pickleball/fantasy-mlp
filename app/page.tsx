import Link from "next/link";
import { data } from "@/lib/data/adapter";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";

export default async function Home() {
  const allEvents = await data.getEvents();
  const now = Date.now();
  const upcoming = allEvents.filter((e) => new Date(e.locksAt).getTime() > now);
  const nextEvent = upcoming[0];
  const me = await getCurrentUser();
  const myLeagues = await prisma.leagueMember.findMany({
    where: { userId: me.id },
    include: { league: { select: { id: true, name: true, _count: { select: { members: true } } } } },
    take: 5,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <p className="font-serif italic text-court text-sm tracking-wide">A salary-cap fantasy game for</p>
        <h1 className="font-display text-6xl font-semibold tracking-tight leading-none">Major League Pickleball.</h1>
        <p className="mt-4 font-serif italic text-lg text-ink/70 max-w-xl">
          Pick three men, three women, stay under the cap. Score the Magnificent Six.
          Trash talk your friends. Lineups lock at first serve.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="font-display text-2xl font-semibold mb-4">2026 season</h2>

          {nextEvent && (
            <Link
              href={`/lineup/${nextEvent.id}`}
              className="panel p-5 flex items-start justify-between hover:border-ink/30 transition mb-3 bg-court/5 border-court/30"
            >
              <div>
                <div className="text-xs font-display font-semibold text-court uppercase tracking-wide mb-1">Next up</div>
                <div className="font-display text-xl font-semibold">{nextEvent.name}</div>
                <div className="text-sm text-ink/60 num">
                  Locks {new Date(nextEvent.locksAt).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
              <span className="text-accent font-display font-semibold whitespace-nowrap">Build lineup →</span>
            </Link>
          )}

          <ul className="panel divide-y divide-line text-sm">
            {allEvents.map((e) => {
              const locked = new Date(e.locksAt).getTime() <= now;
              const isNext = nextEvent && e.id === nextEvent.id;
              return (
                <li key={e.id}>
                  <Link
                    href={`/lineup/${e.id}`}
                    className={`block px-4 py-3 hover:bg-line/30 flex items-center justify-between gap-3 ${locked ? "opacity-50" : ""}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate">{e.name}</span>
                      {locked && <span className="text-xs font-display text-accent">· locked</span>}
                      {isNext && <span className="text-xs font-display text-court">· next</span>}
                    </span>
                    <span className="num font-mono text-xs text-ink/60 whitespace-nowrap">
                      {new Date(e.startsAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold">Your leagues</h2>
            <Link href="/leagues/new" className="text-sm font-display font-semibold text-court underline-offset-4 underline">
              New league
            </Link>
          </div>
          <div className="grid gap-3">
            {myLeagues.length === 0 ? (
              <Link href="/leagues/new" className="panel p-5 text-center">
                <p className="font-serif italic text-ink/60">No leagues yet. Start one and invite the group.</p>
              </Link>
            ) : (
              myLeagues.map(({ league }) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}`}
                  className="panel p-5 flex items-center justify-between hover:border-ink/30 transition"
                >
                  <div>
                    <div className="font-display text-xl font-semibold">{league.name}</div>
                    <div className="text-xs text-ink/60 num">{league._count.members} members</div>
                  </div>
                  <span className="text-accent font-display font-semibold">→</span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
