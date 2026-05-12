import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/currentUser";
import UserSwitcher from "./UserSwitcher";

export default async function TopNav() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <nav className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">Fantasy MLP</Link>
          <Link href="/leagues" className="text-sm hover:underline underline-offset-4">Leagues</Link>
          <Link href="/leaderboard" className="text-sm hover:underline underline-offset-4">Leaderboard</Link>
        </div>
        <UserSwitcher current={{ id: me.id, name: me.name }} users={users.map((u) => ({ id: u.id, name: u.name }))} />
      </div>
    </nav>
  );
}
