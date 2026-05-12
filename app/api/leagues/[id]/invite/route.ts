import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUserId();
  const membership = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId: params.id, userId: me } },
  });
  if (!membership) return NextResponse.json({ ok: false, error: "Not a member." }, { status: 403 });
  const token = randomBytes(12).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600_000);
  await prisma.leagueInvite.create({ data: { token, leagueId: params.id, expiresAt } });
  return NextResponse.json({ ok: true, token, expiresAt: expiresAt.toISOString() });
}
