import { cookies } from "next/headers";
import { prisma } from "./db";

const USER_COOKIE = "demo-user-id";

export async function getCurrentUserId(): Promise<string> {
  return cookies().get(USER_COOKIE)?.value ?? "you";
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  return (
    (await prisma.user.findUnique({ where: { id } })) ??
    (await prisma.user.findUnique({ where: { id: "you" } }))!
  );
}

export const USER_COOKIE_NAME = USER_COOKIE;
