import { QuestProgress } from "@prisma/client";
import { prisma } from "./prisma";

export const QUEST_TARGETS = {
  messages: 20,
  voiceMinutes: 30,
  minigames: 3,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrResetQuest(userId: string): Promise<QuestProgress> {
  const today = todayStr();
  const existing = await prisma.questProgress.findUnique({ where: { userId } });

  if (!existing) {
    return prisma.questProgress.create({ data: { userId, date: today } });
  }
  if (existing.date !== today) {
    return prisma.questProgress.update({
      where: { userId },
      data: { date: today, messages: 0, voiceMinutes: 0, minigames: 0, claimed: false },
    });
  }
  return existing;
}

export async function incrementQuest(userId: string, field: "messages" | "voiceMinutes" | "minigames", amount = 1) {
  const quest = await getOrResetQuest(userId);
  if (quest.claimed) return quest;
  return prisma.questProgress.update({ where: { userId }, data: { [field]: { increment: amount } } });
}

export function isQuestComplete(quest: QuestProgress): boolean {
  return (
    quest.messages >= QUEST_TARGETS.messages &&
    quest.voiceMinutes >= QUEST_TARGETS.voiceMinutes &&
    quest.minigames >= QUEST_TARGETS.minigames
  );
}
