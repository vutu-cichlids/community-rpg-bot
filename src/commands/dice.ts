import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { incrementQuest } from "../lib/quest";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Đoán mặt xúc xắc (1-6), đoán đúng x5 tiền cược")
    .addIntegerOption((opt) => opt.setName("bet").setDescription("Số Coin đặt cược").setRequired(true).setMinValue(10))
    .addIntegerOption((opt) => opt.setName("guess").setDescription("Đoán số từ 1-6").setRequired(true).setMinValue(1).setMaxValue(6)),

  async execute(interaction) {
    const bet = interaction.options.getInteger("bet", true);
    const guess = interaction.options.getInteger("guess", true);
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    if (user.coin < bet) {
      await interaction.reply({ content: "❌ Bạn không đủ Coin để đặt cược mức này.", ephemeral: true });
      return;
    }

    const roll = 1 + Math.floor(Math.random() * 6);
    const win = roll === guess;
    const netChange = win ? bet * 4 : -bet;

    await prisma.user.update({ where: { id: user.id }, data: { coin: user.coin + netChange } });
    await incrementQuest(user.id, "minigames");

    const embed = baseEmbed("🎲 Dice", win ? COLORS.success : COLORS.danger).setDescription(
      `Xúc xắc ra mặt: 🎲 **${roll}**\nBạn đoán: **${guess}**\n\n` +
        (win ? `🎉 Chính xác! Bạn thắng **${(bet * 4).toLocaleString()}** Coin.` : `💸 Sai rồi, mất ${bet.toLocaleString()} Coin.`)
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
