import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { ITEMS } from "../data/items";
import { rollPetSpecies } from "../data/pets";
import { baseEmbed, COLORS } from "../lib/embeds";
import { unlockAchievement } from "../lib/achievements";

const CHEST_ITEM_ID = "mystery_chest";
const droppableItems = ITEMS.filter((i) => i.id !== CHEST_ITEM_ID);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("chest")
    .setDescription("Mở rương bí ẩn")
    .addSubcommand((sub) => sub.setName("open").setDescription("Mở 1 Mystery Chest từ túi đồ")),

  async execute(interaction) {
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const owned = await prisma.inventoryItem.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: CHEST_ITEM_ID } },
    });

    if (!owned || owned.quantity < 1) {
      await interaction.reply({
        content: "❌ Bạn không có Mystery Chest nào. Mua tại `/buy item:mystery_chest`.",
        ephemeral: true,
      });
      return;
    }

    const roll = Math.random();
    let resultText: string;

    if (roll < 0.5) {
      const coinGain = 100 + Math.floor(Math.random() * 400);
      await prisma.user.update({ where: { id: user.id }, data: { coin: { increment: coinGain } } });
      resultText = `💰 Bạn nhận được **${coinGain.toLocaleString()} Coin**!`;
    } else if (roll < 0.85) {
      const item = droppableItems[Math.floor(Math.random() * droppableItems.length)];
      await prisma.inventoryItem.upsert({
        where: { userId_itemId: { userId: user.id, itemId: item.id } },
        update: { quantity: { increment: 1 } },
        create: { userId: user.id, itemId: item.id, quantity: 1 },
      });
      resultText = `${item.emoji} Bạn nhận được vật phẩm **${item.name}**!`;
    } else {
      const species = rollPetSpecies();
      await prisma.pet.create({
        data: {
          ownerId: user.id,
          species: species.species,
          name: species.species,
          power: species.basePower,
          rarity: species.rarity,
        },
      });
      resultText = `${species.emoji} Cực hiếm! Bạn nhận được pet **${species.species}** (${species.rarity})!`;
      await unlockAchievement(user.id, "first_pet");
    }

    if (owned.quantity > 1) {
      await prisma.inventoryItem.update({ where: { id: owned.id }, data: { quantity: { decrement: 1 } } });
    } else {
      await prisma.inventoryItem.delete({ where: { id: owned.id } });
    }

    const embed = baseEmbed("🎁 Mystery Chest", COLORS.gold).setDescription(resultText);
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
