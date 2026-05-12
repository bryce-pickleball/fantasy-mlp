import { NextResponse } from "next/server";
import { data } from "@/lib/data/adapter";
import { validateLineup } from "@/lib/scoring";
import { SALARY_CAP } from "@/lib/types";
import { getCurrentUserId } from "@/lib/currentUser";

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId, playerIds } = body as { eventId: string; playerIds: string[] };
  if (!eventId || !Array.isArray(playerIds)) {
    return NextResponse.json({ ok: false, errors: ["Bad request."] }, { status: 400 });
  }
  const event = await data.getEvent(eventId);
  if (!event) return NextResponse.json({ ok: false, errors: ["Event not found."] }, { status: 404 });

  // Lock enforcement — lineups lock at first serve (well, the morning of).
  if (new Date(event.locksAt) <= new Date()) {
    return NextResponse.json(
      { ok: false, errors: ["Lineups are locked for this event."] },
      { status: 423 }, // 423 Locked
    );
  }

  const me = await getCurrentUserId();
  const players = await data.getPlayersForEvent(eventId);
  const v = validateLineup(players, playerIds, SALARY_CAP);
  if (!v.ok) return NextResponse.json({ ok: false, errors: v.errors }, { status: 422 });
  await data.saveLineup({ eventId, ownerId: me, playerIds });
  return NextResponse.json({ ok: true });
}
