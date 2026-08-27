import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser, getTotalStats } from "../lib/user";
import { xpNeededForLevel } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { getClass } from "../data/classes";
import { prisma } from "../lib/prisma";

function xpBar(xp: number, needed: number, length = 10): string {
  const filled = Math.round((xp / needed) * length);
  return "█".repeat(Math.max(0, Math.min(length, filled))) + "░".repeat(Math.max(0, length - filled));
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Xem hồ sơ nhân vật của bạn hoặc người khác")
    .addUserOption((opt) => opt.setName("user").setDescription("Người muốn xem hồ sơ")),

  async execute(interaction) {
    const target = interaction.options.getUser("user") ?? interaction.user;
    const user = await getOrCreateUser(target.id, interaction.guildId!, target.username);
    const { powerBonus, defenseBonus, hpBonus } = await getTotalStats(user.id);
    const petCount = await prisma.pet.count({ where: { ownerId: user.id } });

    const needed = xpNeededForLevel(user.level);
    const classDef = user.classId ? getClass(user.classId) : undefined;
    const clan = user.clanId ? await prisma.clan.findUnique({ where: { id: user.clanId } }) : null;

    const embed = baseEmbed(`${classDef?.emoji ?? "🌱"} Hồ sơ của ${target.username}`, COLORS.primary)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: "Class", value: classDef ? `${classDef.emoji} ${classDef.name}` : "Chưa chọn (dùng /class)", inline: true },
        { name: "Level", value: `${user.level}`, inline: true },
        { name: "Clan", value: clan ? clan.name : "Không có", inline: true },
        { name: "XP", value: `${xpBar(user.xp, needed)} ${user.xp}/${needed}`, inline: false },
        { name: "💰 Coin", value: `${user.coin.toLocaleString()}`, inline: true },
        { name: "⚔️ Power", value: `${user.power + powerBonus}`, inline: true },
        { name: "🛡️ Defense", value: `${user.defense + defenseBonus}`, inline: true },
        { name: "❤️ HP", value: `${user.hp}/${user.maxHp + hpBonus}`, inline: true },
        { name: "🐾 Pets", value: `${petCount}`, inline: true },
        { name: "🔥 Daily streak", value: `${user.dailyStreak}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
