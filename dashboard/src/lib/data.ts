import { prisma } from "./prisma";

export async function listGuildIds(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    distinct: ["guildId"],
    select: { guildId: true },
    orderBy: { guildId: "asc" },
  });
  return rows.map((r) => r.guildId);
}

export async function getOverview(guildId: string) {
  const [totalPlayers, coinAgg, levelAgg, classGroups, totalPets, totalClans] = await Promise.all([
    prisma.user.count({ where: { guildId } }),
    prisma.user.aggregate({ where: { guildId }, _sum: { coin: true } }),
    prisma.user.aggregate({ where: { guildId }, _avg: { level: true } }),
    prisma.user.groupBy({ by: ["classId"], where: { guildId }, _count: { _all: true } }),
    prisma.pet.count({ where: { owner: { guildId } } }),
    prisma.clan.count({ where: { guildId } }),
  ]);

  return {
    totalPlayers,
    totalCoin: coinAgg._sum.coin ?? 0,
    avgLevel: levelAgg._avg.level ?? 0,
    classDistribution: classGroups
      .map((g) => ({ classId: g.classId ?? "Chưa chọn", count: g._count._all }))
      .sort((a, b) => b.count - a.count),
    totalPets,
    totalClans,
  };
}

export async function getLeaderboards(guildId: string) {
  const [topLevel, topPower, topCoin, topClans] = await Promise.all([
    prisma.user.findMany({ where: { guildId }, orderBy: [{ level: "desc" }, { xp: "desc" }], take: 10 }),
    prisma.user.findMany({ where: { guildId }, orderBy: { power: "desc" }, take: 10 }),
    prisma.user.findMany({ where: { guildId }, orderBy: { coin: "desc" }, take: 10 }),
    prisma.clan.findMany({ where: { guildId }, orderBy: [{ level: "desc" }, { xp: "desc" }], take: 10 }),
  ]);
  return { topLevel, topPower, topCoin, topClans };
}

export async function searchPlayers(guildId: string, query: string) {
  if (!query.trim()) return [];
  return prisma.user.findMany({
    where: {
      guildId,
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { discordId: { contains: query } },
      ],
    },
    take: 20,
    orderBy: { level: "desc" },
  });
}

export async function getPlayer(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { inventory: true, pets: true, achievements: true, clan: true, quest: true },
  });
}
