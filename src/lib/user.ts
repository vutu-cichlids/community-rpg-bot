import { User } from "@prisma/client";
import { prisma } from "./prisma";

export async function getOrCreateUser(discordId: string, guildId: string, username: string): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { discordId_guildId: { discordId, guildId } },
  });
  if (existing) {
    if (existing.username !== username) {
      return prisma.user.update({ where: { id: existing.id }, data: { username } });
    }
    return existing;
  }
  return prisma.user.create({
    data: { discordId, guildId, username },
  });
}

export async function getTotalStats(userId: string) {
  const [equipped, pets] = await Promise.all([
    prisma.inventoryItem.findMany({ where: { userId, equipped: true } }),
    prisma.pet.findMany({ where: { ownerId: userId } }),
  ]);

  const { getItem } = await import("../data/items");

  let powerBonus = 0;
  let defenseBonus = 0;
  let hpBonus = 0;

  for (const inv of equipped) {
    const item = getItem(inv.itemId);
    if (!item) continue;
    powerBonus += item.powerBonus;
    defenseBonus += item.defenseBonus;
    hpBonus += item.hpBonus;
  }

  const petPowerBonus = pets.reduce((sum, p) => sum + Math.floor(p.power * 0.2), 0);

  return { powerBonus: powerBonus + petPowerBonus, defenseBonus, hpBonus };
}
