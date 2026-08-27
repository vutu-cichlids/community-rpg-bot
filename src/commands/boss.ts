import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser, getTotalStats } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, formatDuration, remainingCooldown } from "../lib/cooldown";
import { rollBoss } from "../data/monsters";
import { simulateCombat, randomInRange } from "../lib/combat";
import { applyXpGain } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { checkMilestoneAchievements, unlockAchievement } from "../lib/achievements";

const command: Command = {
  data: new SlashCommandBuilder().setName("boss").setDescription("Đánh boss để nhận Coin và XP (cooldown 1 phút)"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    const remaining = remainingCooldown(user.lastBoss, COOLDOWNS.boss);
    if (remaining > 0) {
      await interaction.reply({ content: `⏳ Boss đang hồi sức. Thử lại sau **${formatDuration(remaining)}**.`, ephemeral: true });
      return;
    }

    if (user.hp <= 0) {
      await interaction.reply({ content: "❌ HP của bạn đã cạn. Mua Health Potion ở `/shop` rồi dùng `/use item:health_potion` để hồi phục.", ephemeral: true });
      return;
    }

    const { powerBonus, defenseBonus, hpBonus } = await getTotalStats(user.id);
    const boss = rollBoss(user.level);

    const result = simulateCombat(
      { power: user.power + powerBonus, defense: user.defense + defenseBonus, hp: user.hp },
      { power: boss.power, defense: boss.defense, hp: boss.hp }
    );

    const newHp = Math.max(0, user.hp - result.playerDamageTaken);
    let embed;

    if (result.win) {
      const coinGain = randomInRange(boss.coinReward);
      const xpGain = randomInRange(boss.xpReward);
      const leveled = applyXpGain({ ...user, hp: newHp }, xpGain);

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          coin: user.coin + coinGain,
          lastBoss: new Date(),
          level: leveled.level,
          xp: leveled.xp,
          power: leveled.power,
          defense: leveled.defense,
          maxHp: leveled.maxHp,
          hp: leveled.hp,
        },
      });

      await unlockAchievement(user.id, "first_boss");
      const unlocked = await checkMilestoneAchievements(updated);

      embed = baseEmbed(`⚔️ Chiến thắng ${boss.emoji} ${boss.name}!`, COLORS.success).setDescription(
        `Sau ${result.rounds} hiệp đấu, bạn đã hạ gục ${boss.name}!\n\n💰 +${coinGain} Coin\n⭐ +${xpGain} XP\n❤️ Mất ${result.playerDamageTaken} HP` +
          (leveled.levelsGained > 0 ? `\n\n🎉 Lên **Level ${leveled.level}**!` : "") +
          (unlocked.length > 0 ? `\n\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
      );
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { hp: Math.max(0, newHp), lastBoss: new Date() },
      });

      embed = baseEmbed(`💀 Thua trận trước ${boss.emoji} ${boss.name}`, COLORS.danger).setDescription(
        `Sau ${result.rounds} hiệp đấu, bạn đã bị đánh bại.\n❤️ Mất ${result.playerDamageTaken} HP\n\nHãy trang bị vũ khí/giáp tốt hơn ở \`/shop\` hoặc lên level trước khi thử lại.`
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
