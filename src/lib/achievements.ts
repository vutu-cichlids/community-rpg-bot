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
const LEVEL_MILESTONES: [number, string][] = [
  [10, "level_10"],
  [25, "level_25"],
  [50, "level_50"],
  [100, "level_100"],
  [250, "level_250"],
  [500, "level_500"],
  [999, "level_999"],
];

export async function checkMilestoneAchievements(user: Pick<User, "id" | "level" | "coin">) {
  const unlocked = [];

  for (const [level, key] of LEVEL_MILESTONES) {
    if (user.level >= level) {
      const a = await unlockAchievement(user.id, key);
      if (a) unlocked.push(a);
    }
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
