import { Message } from "discord.js";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, remainingCooldown } from "../lib/cooldown";
import { applyXpGain } from "../lib/xp";
import { incrementQuest } from "../lib/quest";
import { checkMilestoneAchievements } from "../lib/achievements";
import { baseEmbed, COLORS } from "../lib/embeds";

export async function handleMessageCreate(message: Message) {
  if (message.author.bot || !message.guildId) return;

  const user = await getOrCreateUser(message.author.id, message.guildId, message.author.username);
  await incrementQuest(user.id, "messages");

  if (remainingCooldown(user.lastMessageXp, COOLDOWNS.messageXp) > 0) return;

  const xpGain = 15 + Math.floor(Math.random() * 11);
  const coinGain = 5 + Math.floor(Math.random() * 6);
  const leveled = applyXpGain(user, xpGain);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      coin: user.coin + coinGain,
      lastMessageXp: new Date(),
      level: leveled.level,
      xp: leveled.xp,
      power: leveled.power,
      defense: leveled.defense,
      maxHp: leveled.maxHp,
      hp: leveled.hp,
    },
  });

  if (leveled.levelsGained > 0) {
    const unlocked = await checkMilestoneAchievements(updated);
    const embed = baseEmbed("🎉 Level Up!", COLORS.gold).setDescription(
      `${message.author} đã lên **Level ${leveled.level}**!` +
        (unlocked.length > 0 ? `\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
    );
    const channel = message.channel as { send?: (options: unknown) => Promise<unknown> };
    if (typeof channel.send === "function") {
      await channel.send({ embeds: [embed] }).catch(() => {});
    }
  }
}
