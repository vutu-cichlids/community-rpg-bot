import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { incrementQuest } from "../lib/quest";
import { baseEmbed, COLORS } from "../lib/embeds";

const SYMBOLS = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎"];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("slot")
    .setDescription("Chơi máy Slot")
    .addIntegerOption((opt) => opt.setName("bet").setDescription("Số Coin đặt cược").setRequired(true).setMinValue(10)),

  async execute(interaction) {
    const bet = interaction.options.getInteger("bet", true);
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    if (user.coin < bet) {
      await interaction.reply({ content: "❌ Bạn không đủ Coin để đặt cược mức này.", ephemeral: true });
      return;
    }

    const reels = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    let multiplier = 0;
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      multiplier = reels[0] === "💎" ? 10 : 5;
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      multiplier = 1.5;
    }

    const payout = Math.round(bet * multiplier);
    const netChange = payout - bet;

    await prisma.user.update({ where: { id: user.id }, data: { coin: user.coin + netChange } });
    await incrementQuest(user.id, "minigames");

    const embed = baseEmbed("🎰 Slot Machine", netChange >= 0 ? COLORS.success : COLORS.danger).setDescription(
      `[ ${reels.join(" | ")} ]\n\n` +
        (netChange > 0 ? `🎉 Bạn thắng **${payout.toLocaleString()}** Coin! (net +${netChange.toLocaleString()})` : "💸 Không trúng gì, mất " + bet.toLocaleString() + " Coin.")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
