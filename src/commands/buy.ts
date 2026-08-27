import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getItem, ITEMS } from "../data/items";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Mua vật phẩm từ cửa hàng")
    .addStringOption((opt) =>
      opt
        .setName("item")
        .setDescription("Vật phẩm muốn mua")
        .setRequired(true)
        .addChoices(...ITEMS.map((i) => ({ name: `${i.emoji} ${i.name}`, value: i.id })))
    )
    .addIntegerOption((opt) => opt.setName("quantity").setDescription("Số lượng (mặc định 1)").setMinValue(1)),

  async execute(interaction) {
    const itemId = interaction.options.getString("item", true);
    const quantity = interaction.options.getInteger("quantity") ?? 1;
    const item = getItem(itemId);
    if (!item) {
      await interaction.reply({ content: "Vật phẩm không tồn tại.", ephemeral: true });
      return;
    }

    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const totalCost = item.price * quantity;

    if (user.coin < totalCost) {
      await interaction.reply({
        content: `❌ Bạn không đủ Coin. Cần **${totalCost.toLocaleString()}**, bạn có **${user.coin.toLocaleString()}**.`,
        ephemeral: true,
      });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { coin: user.coin - totalCost } }),
      prisma.inventoryItem.upsert({
        where: { userId_itemId: { userId: user.id, itemId } },
        update: { quantity: { increment: quantity } },
        create: { userId: user.id, itemId, quantity },
      }),
    ]);

    const embed = baseEmbed("✅ Đã mua", COLORS.success).setDescription(
      `Bạn đã mua ${quantity}x ${item.emoji} **${item.name}** với giá 💰${totalCost.toLocaleString()}.\nDùng \`/equip\` để trang bị (weapon/armor) hoặc \`/chest open\` nếu là rương.`
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
