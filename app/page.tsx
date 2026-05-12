import Link from "next/link";
import { data } from "@/lib/data/adapter";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";

export default async function Home() {
  const events = await data.getEvents();
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
          <h2 className="font-display text-2xl font-semibold mb-4">Upcoming events</h2>
          <div className="grid gap-3">
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/lineup/${e.id}`}
                className="panel p-5 flex items-center justify-between hover:border-ink/30 transition"
              >
                <div>
                  <div className="font-display text-xl font-semibold">{e.name}</div>
                  <div className="text-sm text-ink/60 num">
                    Locks {new Date(e.locksAt).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
                  </div>
                </div>
                <span className="text-accent font-display font-semibold">Build lineup →</span>
              </Link>
            ))}
          </div>
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
