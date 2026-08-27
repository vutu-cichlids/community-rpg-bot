import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { ITEMS } from "../data/items";
import { baseEmbed, COLORS } from "../lib/embeds";

const command: Command = {
  data: new SlashCommandBuilder().setName("shop").setDescription("Xem cửa hàng vật phẩm"),

  async execute(interaction) {
    const embed = baseEmbed("🛒 Cửa hàng", COLORS.primary).setDescription(
      ITEMS.map(
        (i) =>
          `${i.emoji} **${i.name}** (${i.rarity}) — 💰${i.price.toLocaleString()}\n` +
          `  ${i.description}` +
          (i.powerBonus || i.defenseBonus || i.hpBonus
            ? `\n  ${i.powerBonus ? `⚔️+${i.powerBonus} ` : ""}${i.defenseBonus ? `🛡️+${i.defenseBonus} ` : ""}${
                i.hpBonus ? `❤️+${i.hpBonus}` : ""
              }`
            : "") +
          `\n  \`/buy item:${i.id}\``
      ).join("\n\n")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
