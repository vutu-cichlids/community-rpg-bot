import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, formatDuration, remainingCooldown } from "../lib/cooldown";
import { applyXpGain } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { checkMilestoneAchievements } from "../lib/achievements";

const command: Command = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Nhận thưởng hàng ngày"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    const remaining = remainingCooldown(user.lastDaily, COOLDOWNS.daily);
    if (remaining > 0) {
      await interaction.reply({
        content: `⏳ Bạn đã nhận thưởng hôm nay rồi. Quay lại sau **${formatDuration(remaining)}**.`,
        ephemeral: true,
      });
      return;
    }

    const brokeStreak = user.lastDaily ? Date.now() - user.lastDaily.getTime() > COOLDOWNS.daily * 2 : false;
    const newStreak = brokeStreak || !user.lastDaily ? 1 : user.dailyStreak + 1;

    const baseCoin = 500;
    const streakBonus = Math.min(newStreak * 50, 1000);
    const coinGain = baseCoin + streakBonus;
    const xpGain = 100 + Math.min(newStreak * 5, 200);

    const leveled = applyXpGain(user, xpGain);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        coin: user.coin + coinGain,
        lastDaily: new Date(),
        dailyStreak: newStreak,
        level: leveled.level,
        xp: leveled.xp,
        power: leveled.power,
        defense: leveled.defense,
        maxHp: leveled.maxHp,
        hp: leveled.hp,
      },
    });

    const unlocked = await checkMilestoneAchievements(updated);

    const embed = baseEmbed("🎁 Daily Reward", COLORS.gold).setDescription(
      `💰 +${coinGain.toLocaleString()} Coin\n⭐ +${xpGain} XP\n🔥 Streak: ${newStreak} ngày` +
        (leveled.levelsGained > 0 ? `\n\n🎉 Chúc mừng lên **Level ${leveled.level}**!` : "") +
        (unlocked.length > 0 ? `\n\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
