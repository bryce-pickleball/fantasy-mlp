import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";

export default async function LeaderboardPage() {
  const me = await getCurrentUser();
  const leagues = await prisma.leagueMember.findMany({
    where: { userId: me.id },
    include: { league: { select: { id: true, name: true, _count: { select: { members: true } } } } },
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6">
        <p className="font-serif italic text-court text-sm">Leaderboards are scoped to your league.</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Pick a league.</h1>
      </header>
      {leagues.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-serif italic text-ink/60 mb-4">No leagues yet.</p>
          <Link href="/leagues/new" className="font-display text-court underline">Create one →</Link>
        </div>
      ) : (
        <ul className="panel divide-y divide-line">
          {leagues.map(({ league }) => (
            <li key={league.id}>
              <Link href={`/leagues/${league.id}`} className="block p-4 hover:bg-line/30 flex items-center justify-between">
                <span className="font-semibold">{league.name}</span>
                <span className="text-xs text-ink/50 num">{league._count.members} members</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
