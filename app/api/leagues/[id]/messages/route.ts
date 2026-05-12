import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(0);
  const msgs = await prisma.leagueMessage.findMany({
    where: { leagueId: params.id, createdAt: { gt: since } },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { id: true, name: true } } },
    take: 200,
  });
  return NextResponse.json({
    ok: true,
    messages: msgs.map((m) => ({
      id: m.id,
      author: m.author,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const text = String(body.body ?? "").trim();
  if (!text) return NextResponse.json({ ok: false, error: "Empty message." }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ ok: false, error: "Too long (500 max)." }, { status: 400 });
  const membership = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId: params.id, userId: me } },
  });
  if (!membership) return NextResponse.json({ ok: false, error: "Not a member." }, { status: 403 });
  const msg = await prisma.leagueMessage.create({
    data: { leagueId: params.id, authorId: me, body: text },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json({
    ok: true,
    message: {
      id: msg.id,
      author: msg.author,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    },
  });
}
