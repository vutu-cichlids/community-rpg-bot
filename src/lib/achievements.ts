import { User } from "@prisma/client";
import { prisma } from "./prisma";
import { ACHIEVEMENTS, getAchievement } from "../data/achievements";

/**
 * Unlocks an achievement for a user if not already unlocked.
 * Returns the achievement def if newly unlocked, otherwise null.
 */
export async function unlockAchievement(userId: string, key: string) {
  const def = getAchievement(key);
  if (!def) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementKey: { userId, achievementKey: key } },
  });
  if (existing) return null;

  await prisma.userAchievement.create({ data: { userId, achievementKey: key } });
  return def;
}

/**
 * Checks level/coin-based milestone achievements after stat changes.
 * Returns any newly unlocked achievement defs.
 */
export async function checkMilestoneAchievements(user: Pick<User, "id" | "level" | "coin">) {
  const unlocked = [];

  if (user.level >= 10) {
    const a = await unlockAchievement(user.id, "level_10");
    if (a) unlocked.push(a);
  }
  if (user.level >= 25) {
    const a = await unlockAchievement(user.id, "level_25");
    if (a) unlocked.push(a);
  }
  if (user.level >= 50) {
    const a = await unlockAchievement(user.id, "level_50");
    if (a) unlocked.push(a);
  }
  if (user.coin >= 10000) {
    const a = await unlockAchievement(user.id, "rich_10k");
    if (a) unlocked.push(a);
  }
  if (user.coin >= 100000) {
    const a = await unlockAchievement(user.id, "rich_100k");
    if (a) unlocked.push(a);
  }

  return unlocked;
}

export { ACHIEVEMENTS };
