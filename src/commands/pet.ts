import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { rollPetSpecies, PET_SPECIES } from "../data/pets";
import { baseEmbed, COLORS } from "../lib/embeds";
import { unlockAchievement } from "../lib/achievements";

const ADOPT_COST = 300;
const FEED_COST = 20;
const TRAIN_COST = 50;
const MAX_PETS = 6;

function petXpNeeded(level: number): number {
  return 50 + level * 20;
}

function rarityEmoji(rarity: string): string {
  return { common: "⚪", rare: "🔵", epic: "🟣", legendary: "🟡" }[rarity] ?? "⚪";
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("pet")
    .setDescription("Hệ thống nuôi pet")
    .addSubcommand((sub) => sub.setName("adopt").setDescription(`Nhận nuôi pet ngẫu nhiên (💰${ADOPT_COST})`))
    .addSubcommand((sub) => sub.setName("list").setDescription("Xem danh sách pet của bạn"))
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("Xem chi tiết một pet")
        .addIntegerOption((opt) => opt.setName("slot").setDescription("Số thứ tự trong /pet list").setRequired(true).setMinValue(1))
    )
    .addSubcommand((sub) =>
      sub
        .setName("feed")
        .setDescription(`Cho pet ăn để hồi hunger/energy (💰${FEED_COST})`)
        .addIntegerOption((opt) => opt.setName("slot").setDescription("Số thứ tự trong /pet list").setRequired(true).setMinValue(1))
    )
    .addSubcommand((sub) =>
      sub
        .setName("train")
        .setDescription(`Huấn luyện pet để tăng XP/power (💰${TRAIN_COST}, tốn energy)`)
        .addIntegerOption((opt) => opt.setName("slot").setDescription("Số thứ tự trong /pet list").setRequired(true).setMinValue(1))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    if (sub === "adopt") {
      const count = await prisma.pet.count({ where: { ownerId: user.id } });
      if (count >= MAX_PETS) {
        await interaction.reply({ content: `❌ Bạn đã đạt giới hạn ${MAX_PETS} pet.`, ephemeral: true });
        return;
      }
      if (user.coin < ADOPT_COST) {
        await interaction.reply({ content: `❌ Cần 💰${ADOPT_COST} để nhận nuôi pet.`, ephemeral: true });
        return;
      }

      const species = rollPetSpecies();
      const [, pet] = await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { coin: { decrement: ADOPT_COST } } }),
        prisma.pet.create({
          data: { ownerId: user.id, species: species.species, name: species.species, power: species.basePower, rarity: species.rarity },
        }),
      ]);

      await unlockAchievement(user.id, "first_pet");

      const embed = baseEmbed("🐾 Nhận nuôi thành công!", COLORS.success).setDescription(
        `Bạn vừa nhận nuôi ${species.emoji} **${pet.species}** (${rarityEmoji(species.rarity)} ${species.rarity})!`
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const pets = await prisma.pet.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "asc" } });

    if (sub === "list") {
      if (pets.length === 0) {
        await interaction.reply({ content: "🐾 Bạn chưa có pet nào. Dùng `/pet adopt` để nhận nuôi.", ephemeral: true });
        return;
      }
      const embed = baseEmbed(`🐾 Pet của ${interaction.user.username}`, COLORS.primary).setDescription(
        pets
          .map((p, i) => {
            const species = PET_SPECIES.find((s) => s.species === p.species);
            return `**#${i + 1}** ${species?.emoji ?? "🐾"} ${p.name} — Lv.${p.level} ${rarityEmoji(p.rarity)} ${p.rarity} | ⚔️${p.power}`;
          })
          .join("\n")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const slot = interaction.options.getInteger("slot", true);
    const pet = pets[slot - 1];
    if (!pet) {
      await interaction.reply({ content: `❌ Không tìm thấy pet #${slot}. Dùng \`/pet list\` để xem danh sách.`, ephemeral: true });
      return;
    }
    const species = PET_SPECIES.find((s) => s.species === pet.species);

    if (sub === "info") {
      const embed = baseEmbed(`${species?.emoji ?? "🐾"} ${pet.name}`, COLORS.primary).addFields(
        { name: "Rarity", value: `${rarityEmoji(pet.rarity)} ${pet.rarity}`, inline: true },
        { name: "Level", value: `${pet.level}`, inline: true },
        { name: "XP", value: `${pet.xp}/${petXpNeeded(pet.level)}`, inline: true },
        { name: "⚔️ Power", value: `${pet.power}`, inline: true },
        { name: "🍖 Hunger", value: `${pet.hunger}%`, inline: true },
        { name: "😊 Happiness", value: `${pet.happiness}%`, inline: true },
        { name: "⚡ Energy", value: `${pet.energy}%`, inline: true }
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "feed") {
      if (user.coin < FEED_COST) {
        await interaction.reply({ content: `❌ Cần 💰${FEED_COST} để cho ăn.`, ephemeral: true });
        return;
      }
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { coin: { decrement: FEED_COST } } }),
        prisma.pet.update({
          where: { id: pet.id },
          data: {
            hunger: Math.min(100, pet.hunger + 30),
            happiness: Math.min(100, pet.happiness + 10),
            energy: Math.min(100, pet.energy + 20),
          },
        }),
      ]);
      const embed = baseEmbed("🍖 Đã cho ăn", COLORS.success).setDescription(`${pet.name} đã được cho ăn và hồi phục năng lượng.`);
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "train") {
      if (user.coin < TRAIN_COST) {
        await interaction.reply({ content: `❌ Cần 💰${TRAIN_COST} để huấn luyện.`, ephemeral: true });
        return;
      }
      if (pet.energy < 20) {
        await interaction.reply({ content: `❌ ${pet.name} đang quá mệt (energy thấp). Hãy cho ăn trước.`, ephemeral: true });
        return;
      }

      let { level, power } = pet;
      let xp = pet.xp + (15 + Math.floor(Math.random() * 15));
      let leveledUp = false;
      while (xp >= petXpNeeded(level)) {
        xp -= petXpNeeded(level);
        level += 1;
        power += 3;
        leveledUp = true;
      }

      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { coin: { decrement: TRAIN_COST } } }),
        prisma.pet.update({
          where: { id: pet.id },
          data: { xp, level, power, energy: Math.max(0, pet.energy - 20), hunger: Math.max(0, pet.hunger - 10) },
        }),
      ]);

      const embed = baseEmbed("💪 Huấn luyện hoàn tất", COLORS.success).setDescription(
        `${pet.name} đã nhận thêm XP.` + (leveledUp ? `\n🎉 ${pet.name} đã lên **Level ${level}**! (⚔️${power})` : "")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};

export default command;
