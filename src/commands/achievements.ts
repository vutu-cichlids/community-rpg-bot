import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { ACHIEVEMENTS } from "../data/achievements";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder().setName("achievements").setDescription("Xem danh sách thành tựu"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const unlocked = await prisma.userAchievement.findMany({ where: { userId: user.id } });
    const unlockedKeys = new Set(unlocked.map((u) => u.achievementKey));

    const embed = baseEmbed(`🏆 Thành tựu (${unlockedKeys.size}/${ACHIEVEMENTS.length})`, COLORS.gold).setDescription(
      ACHIEVEMENTS.map((a) => `${unlockedKeys.has(a.key) ? "✅" : "🔒"} ${a.emoji} **${a.name}** — ${a.description}`).join("\n")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
