import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { USER_COOKIE_NAME } from "@/lib/currentUser";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ ok: false, error: "Unknown user." }, { status: 404 });
  cookies().set(USER_COOKIE_NAME, user.id, { httpOnly: false, sameSite: "lax", path: "/" });
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name } });
}
