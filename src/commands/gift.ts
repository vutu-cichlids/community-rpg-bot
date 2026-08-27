import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription("Tặng Coin cho thành viên khác")
    .addUserOption((opt) => opt.setName("user").setDescription("Người nhận").setRequired(true))
    .addIntegerOption((opt) => opt.setName("amount").setDescription("Số Coin muốn tặng").setRequired(true).setMinValue(1)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user", true);
    const amount = interaction.options.getInteger("amount", true);

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Bạn không thể tự tặng cho chính mình.", ephemeral: true });
      return;
    }
    if (targetUser.bot) {
      await interaction.reply({ content: "❌ Không thể tặng Coin cho bot.", ephemeral: true });
      return;
    }

    const sender = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    if (sender.coin < amount) {
      await interaction.reply({ content: "❌ Bạn không đủ Coin.", ephemeral: true });
      return;
    }

    const receiver = await getOrCreateUser(targetUser.id, interaction.guildId!, targetUser.username);

    await prisma.$transaction([
      prisma.user.update({ where: { id: sender.id }, data: { coin: { decrement: amount } } }),
      prisma.user.update({ where: { id: receiver.id }, data: { coin: { increment: amount } } }),
    ]);

    const embed = baseEmbed("🎁 Đã tặng quà", COLORS.success).setDescription(
      `${interaction.user.username} đã tặng 💰${amount.toLocaleString()} Coin cho **${targetUser.username}**!`
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
