import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser, getTotalStats } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, formatDuration, remainingCooldown } from "../lib/cooldown";
import { pickMonster, DUNGEONS } from "../data/monsters";
import { simulateCombat, randomInRange } from "../lib/combat";
import { applyXpGain } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { checkMilestoneAchievements, unlockAchievement } from "../lib/achievements";

const command: Command = {
  data: new SlashCommandBuilder().setName("raid").setDescription("Raid dungeon để nhận phần thưởng lớn (cooldown 10 phút)"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    const remaining = remainingCooldown(user.lastRaid, COOLDOWNS.raid);
    if (remaining > 0) {
      await interaction.reply({ content: `⏳ Dungeon chưa mở lại. Thử lại sau **${formatDuration(remaining)}**.`, ephemeral: true });
      return;
    }

    if (user.hp <= 0) {
      await interaction.reply({ content: "❌ HP của bạn đã cạn. Hãy hồi phục trước khi raid.", ephemeral: true });
      return;
    }

    const { powerBonus, defenseBonus } = await getTotalStats(user.id);
    const dungeon = pickMonster(DUNGEONS, user.level);

    const result = simulateCombat(
      { power: user.power + powerBonus, defense: user.defense + defenseBonus, hp: user.hp },
      { power: dungeon.power, defense: dungeon.defense, hp: dungeon.hp }
    );

    const newHp = Math.max(0, user.hp - result.playerDamageTaken);
    let embed;

    if (result.win) {
      const coinGain = randomInRange(dungeon.coinReward);
      const xpGain = randomInRange(dungeon.xpReward);
      const leveled = applyXpGain({ ...user, hp: newHp }, xpGain);

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          coin: user.coin + coinGain,
          lastRaid: new Date(),
          level: leveled.level,
          xp: leveled.xp,
          power: leveled.power,
          defense: leveled.defense,
          maxHp: leveled.maxHp,
          hp: leveled.hp,
        },
      });

      await unlockAchievement(user.id, "first_raid");
      const unlocked = await checkMilestoneAchievements(updated);

      embed = baseEmbed(`🧌 Hoàn thành Raid: ${dungeon.emoji} ${dungeon.name}`, COLORS.success).setDescription(
        `Sau ${result.rounds} hiệp đấu ác liệt, bạn đã chinh phục dungeon!\n\n💰 +${coinGain} Coin\n⭐ +${xpGain} XP\n❤️ Mất ${result.playerDamageTaken} HP` +
          (leveled.levelsGained > 0 ? `\n\n🎉 Lên **Level ${leveled.level}**!` : "") +
          (unlocked.length > 0 ? `\n\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
      );
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { hp: Math.max(1, newHp), lastRaid: new Date() },
      });

      embed = baseEmbed(`💀 Raid thất bại: ${dungeon.emoji} ${dungeon.name}`, COLORS.danger).setDescription(
        `Đội hình của bạn chưa đủ mạnh.\n❤️ Mất ${result.playerDamageTaken} HP\n\nHãy nâng cấp trang bị hoặc lên level trước khi raid lại.`
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
