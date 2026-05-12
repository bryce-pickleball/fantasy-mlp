import { NextResponse } from "next/server";
import { scoreLineup } from "@/lib/scoring";
import type { MatchResult } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId, ownerId, playerIds, results } = body as {
    eventId: string;
    ownerId: string;
    playerIds: string[];
    results: MatchResult[];
  };
  if (!eventId || !ownerId || !Array.isArray(playerIds) || !Array.isArray(results)) {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const score = scoreLineup(eventId, ownerId, playerIds, results);
  return NextResponse.json({ ok: true, score });
}
