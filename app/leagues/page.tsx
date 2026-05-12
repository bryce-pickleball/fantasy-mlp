import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";

export default async function LeaguesPage() {
  const me = await getCurrentUser();
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: me.id },
    include: { league: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-serif italic text-court text-sm">Hey {me.name},</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Your leagues.</h1>
        </div>
        <Link href="/leagues/new" className="font-display font-semibold px-4 py-2 rounded bg-ink text-paper">
          New league
        </Link>
      </header>

      {memberships.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-serif italic text-ink/60 mb-4">No leagues yet. Start one and invite the group.</p>
          <Link href="/leagues/new" className="font-display font-semibold text-court underline-offset-4 underline">
            Create your first league →
          </Link>
        </div>
      ) : (
        <ul className="panel divide-y divide-line">
          {memberships.map(({ league, role, joinedAt }) => (
            <li key={league.id}>
              <Link href={`/leagues/${league.id}`} className="block p-5 hover:bg-line/30 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl font-semibold">{league.name}</div>
                    <div className="text-xs text-ink/60 num">
                      {league._count.members} member{league._count.members === 1 ? "" : "s"}
                      {role === "commissioner" && <> · <span className="text-court">commissioner</span></>}
                      <> · joined {new Date(joinedAt).toLocaleDateString()}</>
                    </div>
                  </div>
                  <span className="text-accent font-display">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
