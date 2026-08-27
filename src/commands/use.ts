import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getItem, ITEMS } from "../data/items";
import { getOrCreateUser, getTotalStats } from "../lib/user";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";

const consumables = ITEMS.filter((i) => i.type === "consumable");

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Dùng một vật phẩm tiêu hao từ túi đồ")
    .addStringOption((opt) =>
      opt
        .setName("item")
        .setDescription("Vật phẩm muốn dùng")
        .setRequired(true)
        .addChoices(...consumables.map((i) => ({ name: `${i.emoji} ${i.name}`, value: i.id })))
    ),

  async execute(interaction) {
    const itemId = interaction.options.getString("item", true);
    const item = getItem(itemId);
    if (!item || item.type !== "consumable") {
      await interaction.reply({ content: "Vật phẩm này không thể dùng.", ephemeral: true });
      return;
    }

    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const owned = await prisma.inventoryItem.findUnique({ where: { userId_itemId: { userId: user.id, itemId } } });

    if (!owned || owned.quantity < 1) {
      await interaction.reply({ content: `❌ Bạn chưa sở hữu ${item.emoji} ${item.name}.`, ephemeral: true });
      return;
    }

    const { hpBonus } = await getTotalStats(user.id);
    const maxHp = user.maxHp + hpBonus;

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { hp: maxHp } }),
      owned.quantity > 1
        ? prisma.inventoryItem.update({ where: { id: owned.id }, data: { quantity: { decrement: 1 } } })
        : prisma.inventoryItem.delete({ where: { id: owned.id } }),
    ]);

    const embed = baseEmbed("🧪 Đã sử dụng", COLORS.success).setDescription(
      `Bạn đã dùng ${item.emoji} **${item.name}** và hồi đầy HP (${maxHp}/${maxHp}).`
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
