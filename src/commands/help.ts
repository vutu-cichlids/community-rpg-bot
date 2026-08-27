import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("Danh sách lệnh của Community RPG Bot"),

  async execute(interaction) {
    const embed = baseEmbed("📖 Community RPG Bot — Danh sách lệnh", COLORS.primary).addFields(
      {
        name: "🧑 Nhân vật",
        value: "`/profile` `/class` — xem/chọn class và thông số nhân vật",
      },
      {
        name: "💰 Kinh tế",
        value: "`/daily` `/work` `/shop` `/buy` `/inventory` `/equip` `/use` `/gift`",
      },
      {
        name: "⚔️ Chiến đấu",
        value: "`/boss` `/raid` `/duel`",
      },
      {
        name: "🎁 Vòng quay & Mini game",
        value: "`/chest open` `/slot` `/dice`",
      },
      {
        name: "🐾 Pet",
        value: "`/pet adopt` `/pet list` `/pet info` `/pet feed` `/pet train`",
      },
      {
        name: "🏰 Clan",
        value: "`/clan create` `/clan join` `/clan leave` `/clan info` `/clan leaderboard` `/clan deposit`",
      },
      {
        name: "📜 Tiến trình",
        value: "`/quest view` `/quest claim` `/achievements` `/leaderboard`",
      },
      {
        name: "💡 Mẹo tăng XP thụ động",
        value: "Chat và ở trong Voice channel cũng tự động cộng XP/Coin theo thời gian.",
      }
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
