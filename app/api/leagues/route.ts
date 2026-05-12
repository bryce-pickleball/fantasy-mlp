import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  const me = await getCurrentUserId();
  const league = await prisma.league.create({
    data: {
      name,
      commissionerId: me,
      members: { create: { userId: me, role: "commissioner" } },
    },
  });
  return NextResponse.json({ ok: true, leagueId: league.id });
}
