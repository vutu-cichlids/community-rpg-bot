"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, isValidPassword, isValidSession, sessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Server Actions can be invoked directly with their action ID, bypassing
 * middleware's page-level auth check (see GHSA-955p-x3mx-jcvp). Every
 * mutating action must re-check the session itself rather than trust that
 * the request came through a gated page.
 */
async function requireAuth() {
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(cookie))) {
    throw new Error("Unauthorized");
  }
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!isValidPassword(password)) {
    redirect("/admin/login?error=1");
  }
  cookies().set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function updatePlayer(id: string, formData: FormData) {
  await requireAuth();
  const fields = ["level", "xp", "coin", "power", "defense", "maxHp", "hp"] as const;
  const data: Record<string, number> = {};
  for (const field of fields) {
    const raw = formData.get(field);
    if (raw !== null && raw !== "") {
      const num = Number(raw);
      if (Number.isFinite(num)) data[field] = Math.trunc(num);
    }
  }
  await prisma.user.update({ where: { id }, data });
  revalidatePath(`/admin/player/${id}`);
}

export async function resetCooldowns(id: string) {
  await requireAuth();
  await prisma.user.update({
    where: { id },
    data: { lastDaily: null, lastWork: null, lastBoss: null, lastRaid: null, lastDuel: null },
  });
  revalidatePath(`/admin/player/${id}`);
}
