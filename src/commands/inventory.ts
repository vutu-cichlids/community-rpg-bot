import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { getItem } from "../data/items";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder().setName("inventory").setDescription("Xem túi đồ của bạn"),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const items = await prisma.inventoryItem.findMany({ where: { userId: user.id } });

    if (items.length === 0) {
      await interaction.reply({ content: "🎒 Túi đồ của bạn đang trống. Dùng `/shop` để mua vật phẩm.", ephemeral: true });
      return;
    }

    const embed = baseEmbed("🎒 Túi đồ", COLORS.primary).setDescription(
      items
        .map((inv) => {
          const def = getItem(inv.itemId);
          if (!def) return null;
          return `${def.emoji} **${def.name}** x${inv.quantity}${inv.equipped ? " ✅ (đang trang bị)" : ""}`;
        })
        .filter(Boolean)
        .join("\n")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
