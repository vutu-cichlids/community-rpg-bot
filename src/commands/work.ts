import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, formatDuration, remainingCooldown } from "../lib/cooldown";
import { applyXpGain } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { checkMilestoneAchievements } from "../lib/achievements";

const JOBS = [
  { verb: "dọn dẹp quán rượu", emoji: "🍺" },
  { verb: "săn quái nhỏ ở ngoại ô", emoji: "🗡️" },
  { verb: "giao hàng cho thương nhân", emoji: "📦" },
  { verb: "canh gác cổng thành", emoji: "🏰" },
  { verb: "hái thảo dược trong rừng", emoji: "🌿" },
  { verb: "rèn vũ khí cho thợ rèn", emoji: "🔨" },
];

const command: Command = {
  data: new SlashCommandBuilder().setName("work").setDescription("Làm việc kiếm Coin (cooldown 30 phút)"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    const remaining = remainingCooldown(user.lastWork, COOLDOWNS.work);
    if (remaining > 0) {
      await interaction.reply({
        content: `⏳ Bạn cần nghỉ ngơi. Quay lại làm việc sau **${formatDuration(remaining)}**.`,
        ephemeral: true,
      });
      return;
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const coinGain = 80 + Math.floor(Math.random() * 120);
    const xpGain = 15 + Math.floor(Math.random() * 20);

    const leveled = applyXpGain(user, xpGain);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        coin: user.coin + coinGain,
        lastWork: new Date(),
        level: leveled.level,
        xp: leveled.xp,
        power: leveled.power,
        defense: leveled.defense,
        maxHp: leveled.maxHp,
        hp: leveled.hp,
      },
    });

    const unlocked = await checkMilestoneAchievements(updated);

    const embed = baseEmbed("💼 Work", COLORS.success).setDescription(
      `${job.emoji} Bạn đã ${job.verb} và kiếm được:\n💰 +${coinGain} Coin\n⭐ +${xpGain} XP` +
        (leveled.levelsGained > 0 ? `\n\n🎉 Lên **Level ${leveled.level}**!` : "") +
        (unlocked.length > 0 ? `\n\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
