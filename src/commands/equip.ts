import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getItem, ITEMS } from "../data/items";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";

const equippableItems = ITEMS.filter((i) => i.type === "weapon" || i.type === "armor");

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("equip")
    .setDescription("Trang bị vũ khí hoặc giáp từ túi đồ")
    .addStringOption((opt) =>
      opt
        .setName("item")
        .setDescription("Vật phẩm muốn trang bị")
        .setRequired(true)
        .addChoices(...equippableItems.map((i) => ({ name: `${i.emoji} ${i.name}`, value: i.id })))
    ),

  async execute(interaction) {
    const itemId = interaction.options.getString("item", true);
    const item = getItem(itemId);
    if (!item || (item.type !== "weapon" && item.type !== "armor")) {
      await interaction.reply({ content: "Vật phẩm này không thể trang bị.", ephemeral: true });
      return;
    }

    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const owned = await prisma.inventoryItem.findUnique({ where: { userId_itemId: { userId: user.id, itemId } } });

    if (!owned || owned.quantity < 1) {
      await interaction.reply({ content: `❌ Bạn chưa sở hữu ${item.emoji} ${item.name}. Mua tại \`/shop\`.`, ephemeral: true });
      return;
    }

    const sameTypeIds = ITEMS.filter((i) => i.type === item.type).map((i) => i.id);
    const currentlyEquipped = await prisma.inventoryItem.findMany({
      where: { userId: user.id, equipped: true, itemId: { in: sameTypeIds } },
    });

    await prisma.$transaction([
      ...currentlyEquipped.map((inv) =>
        prisma.inventoryItem.update({ where: { id: inv.id }, data: { equipped: false } })
      ),
      prisma.inventoryItem.update({ where: { id: owned.id }, data: { equipped: true } }),
    ]);

    const embed = baseEmbed("✅ Đã trang bị", COLORS.success).setDescription(
      `Bạn đã trang bị ${item.emoji} **${item.name}**.`
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
