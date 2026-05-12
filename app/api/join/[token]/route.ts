import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const me = await getCurrentUserId();
  const invite = await prisma.leagueInvite.findUnique({ where: { token: params.token } });
  if (!invite) return NextResponse.json({ ok: false, error: "Invite not found." }, { status: 404 });
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "Invite expired." }, { status: 410 });
  }
  await prisma.leagueMember.upsert({
    where: { leagueId_userId: { leagueId: invite.leagueId, userId: me } },
    update: {},
    create: { leagueId: invite.leagueId, userId: me },
  });
  // Single-use invite: mark consumed but allow re-clicks to be idempotent for existing members.
  if (!invite.usedAt) {
    await prisma.leagueInvite.update({ where: { token: params.token }, data: { usedAt: new Date() } });
  }
  return NextResponse.json({ ok: true, leagueId: invite.leagueId });
}
