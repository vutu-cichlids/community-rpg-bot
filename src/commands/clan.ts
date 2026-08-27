import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { baseEmbed, COLORS } from "../lib/embeds";
import { unlockAchievement } from "../lib/achievements";

const CREATE_COST = 1000;

function clanXpNeeded(level: number): number {
  return 500 + level * 300;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("clan")
    .setDescription("Hệ thống Clan/Guild")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription(`Tạo clan mới (💰${CREATE_COST})`)
        .addStringOption((opt) => opt.setName("name").setDescription("Tên clan").setRequired(true).setMaxLength(32))
    )
    .addSubcommand((sub) =>
      sub
        .setName("join")
        .setDescription("Tham gia một clan")
        .addStringOption((opt) => opt.setName("name").setDescription("Tên clan").setRequired(true))
    )
    .addSubcommand((sub) => sub.setName("leave").setDescription("Rời khỏi clan hiện tại"))
    .addSubcommand((sub) => sub.setName("info").setDescription("Xem thông tin clan hiện tại"))
    .addSubcommand((sub) => sub.setName("leaderboard").setDescription("Xếp hạng clan trong server"))
    .addSubcommand((sub) =>
      sub
        .setName("deposit")
        .setDescription("Nạp Coin vào quỹ clan (tăng clan XP)")
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Số Coin muốn nạp").setRequired(true).setMinValue(1))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;
    const user = await getOrCreateUser(interaction.user.id, guildId, interaction.user.username);

    if (sub === "create") {
      const name = interaction.options.getString("name", true).trim();
      if (user.clanId) {
        await interaction.reply({ content: "❌ Bạn đã ở trong một clan. Rời clan hiện tại trước.", ephemeral: true });
        return;
      }
      if (user.coin < CREATE_COST) {
        await interaction.reply({ content: `❌ Cần 💰${CREATE_COST} để tạo clan.`, ephemeral: true });
        return;
      }
      const existing = await prisma.clan.findUnique({ where: { guildId_name: { guildId, name } } });
      if (existing) {
        await interaction.reply({ content: "❌ Đã có clan trùng tên trong server này.", ephemeral: true });
        return;
      }

      const clan = await prisma.clan.create({ data: { guildId, name, leaderId: user.id } });
      await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id, coin: { decrement: CREATE_COST } } });
      await unlockAchievement(user.id, "first_clan");

      const embed = baseEmbed("🏰 Clan đã được thành lập!", COLORS.success).setDescription(
        `Clan **${clan.name}** đã được tạo. Bạn là leader.`
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "join") {
      const name = interaction.options.getString("name", true).trim();
      if (user.clanId) {
        await interaction.reply({ content: "❌ Bạn đã ở trong một clan. Rời clan hiện tại trước.", ephemeral: true });
        return;
      }
      const clan = await prisma.clan.findUnique({ where: { guildId_name: { guildId, name } } });
      if (!clan) {
        await interaction.reply({ content: "❌ Không tìm thấy clan này.", ephemeral: true });
        return;
      }
      await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id } });
      await unlockAchievement(user.id, "first_clan");

      const embed = baseEmbed("✅ Đã tham gia clan", COLORS.success).setDescription(`Bạn đã tham gia **${clan.name}**.`);
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "leave") {
      if (!user.clanId) {
        await interaction.reply({ content: "❌ Bạn chưa ở trong clan nào.", ephemeral: true });
        return;
      }
      const clan = await prisma.clan.findUnique({ where: { id: user.clanId }, include: { members: true } });
      await prisma.user.update({ where: { id: user.id }, data: { clanId: null } });

      if (clan && clan.leaderId === user.id) {
        const remaining = clan.members.filter((m) => m.id !== user.id);
        if (remaining.length === 0) {
          await prisma.clan.delete({ where: { id: clan.id } });
        } else {
          await prisma.clan.update({ where: { id: clan.id }, data: { leaderId: remaining[0].id } });
        }
      }

      await interaction.reply({ content: "👋 Bạn đã rời clan.", ephemeral: true });
      return;
    }

    if (sub === "info") {
      if (!user.clanId) {
        await interaction.reply({ content: "❌ Bạn chưa ở trong clan nào. Dùng `/clan create` hoặc `/clan join`.", ephemeral: true });
        return;
      }
      const clan = await prisma.clan.findUnique({ where: { id: user.clanId }, include: { members: true } });
      if (!clan) {
        await interaction.reply({ content: "❌ Không tìm thấy clan.", ephemeral: true });
        return;
      }
      const embed = baseEmbed(`🏰 ${clan.name}`, COLORS.primary).addFields(
        { name: "Level", value: `${clan.level}`, inline: true },
        { name: "XP", value: `${clan.xp}/${clanXpNeeded(clan.level)}`, inline: true },
        { name: "💰 Bank", value: `${clan.bank.toLocaleString()}`, inline: true },
        { name: "Thành viên", value: `${clan.members.length}`, inline: true },
        { name: "Danh sách", value: clan.members.map((m) => m.username).join(", ") || "—" }
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "leaderboard") {
      const clans = await prisma.clan.findMany({ where: { guildId }, orderBy: [{ level: "desc" }, { xp: "desc" }], take: 10 });
      if (clans.length === 0) {
        await interaction.reply({ content: "Chưa có clan nào trong server này.", ephemeral: true });
        return;
      }
      const medals = ["🥇", "🥈", "🥉"];
      const embed = baseEmbed("🏆 Bảng xếp hạng Clan", COLORS.gold).setDescription(
        clans.map((c, i) => `${medals[i] ?? `#${i + 1}`} **${c.name}** — Lv.${c.level} | 💰${c.bank.toLocaleString()}`).join("\n")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "deposit") {
      const amount = interaction.options.getInteger("amount", true);
      if (!user.clanId) {
        await interaction.reply({ content: "❌ Bạn chưa ở trong clan nào.", ephemeral: true });
        return;
      }
      if (user.coin < amount) {
        await interaction.reply({ content: "❌ Bạn không đủ Coin.", ephemeral: true });
        return;
      }
      const clan = await prisma.clan.findUnique({ where: { id: user.clanId } });
      if (!clan) return;

      let { level, bank } = clan;
      let xp = clan.xp + amount;
      bank += amount;
      let leveledUp = false;
      while (xp >= clanXpNeeded(level)) {
        xp -= clanXpNeeded(level);
        level += 1;
        leveledUp = true;
      }

      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { coin: { decrement: amount } } }),
        prisma.clan.update({ where: { id: clan.id }, data: { xp, level, bank } }),
      ]);

      const embed = baseEmbed("🏦 Đã nạp vào quỹ clan", COLORS.success).setDescription(
        `Bạn đã nạp 💰${amount.toLocaleString()} vào **${clan.name}**.` + (leveledUp ? `\n🎉 Clan đã lên **Level ${level}**!` : "")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }
  },
};

export default command;
