import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";

const MEDALS = ["🥇", "🥈", "🥉"];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Bảng xếp hạng server")
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Xếp hạng theo")
        .addChoices(
          { name: "Level", value: "level" },
          { name: "Power", value: "power" },
          { name: "Coin", value: "coin" }
        )
    ),

  async execute(interaction) {
    const type = (interaction.options.getString("type") ?? "level") as "level" | "power" | "coin";

    const orderBy = type === "level" ? [{ level: "desc" as const }, { xp: "desc" as const }] : [{ [type]: "desc" as const }];

    const users = await prisma.user.findMany({
      where: { guildId: interaction.guildId! },
      orderBy,
      take: 10,
    });

    if (users.length === 0) {
      await interaction.reply({ content: "Chưa có dữ liệu xếp hạng.", ephemeral: true });
      return;
    }

    const labelFor = (u: (typeof users)[number]) => {
      if (type === "level") return `Level ${u.level}`;
      if (type === "power") return `⚔️ ${u.power}`;
      return `💰 ${u.coin.toLocaleString()}`;
    };

    const embed = baseEmbed(`🏆 Bảng xếp hạng — ${type === "level" ? "Level" : type === "power" ? "Power" : "Coin"}`, COLORS.gold).setDescription(
      users.map((u, i) => `${MEDALS[i] ?? `#${i + 1}`} **${u.username}** — ${labelFor(u)}`).join("\n")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
