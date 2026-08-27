import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser, getTotalStats } from "../lib/user";
import { prisma } from "../lib/prisma";
import { COOLDOWNS, formatDuration, remainingCooldown } from "../lib/cooldown";
import { simulateCombat } from "../lib/combat";
import { baseEmbed, COLORS } from "../lib/embeds";
import { unlockAchievement } from "../lib/achievements";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Thách đấu PvP với một thành viên khác")
    .addUserOption((opt) => opt.setName("opponent").setDescription("Người muốn thách đấu").setRequired(true))
    .addIntegerOption((opt) => opt.setName("wager").setDescription("Số Coin đặt cược (tùy chọn)").setMinValue(0)),

  async execute(interaction) {
    const opponentUser = interaction.options.getUser("opponent", true);
    const wager = interaction.options.getInteger("wager") ?? 0;

    if (opponentUser.id === interaction.user.id) {
      await interaction.reply({ content: "❌ Bạn không thể tự thách đấu chính mình.", ephemeral: true });
      return;
    }
    if (opponentUser.bot) {
      await interaction.reply({ content: "❌ Không thể thách đấu bot.", ephemeral: true });
      return;
    }

    const challenger = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const remaining = remainingCooldown(challenger.lastDuel, COOLDOWNS.duel);
    if (remaining > 0) {
      await interaction.reply({ content: `⏳ Bạn cần nghỉ. Thách đấu lại sau **${formatDuration(remaining)}**.`, ephemeral: true });
      return;
    }

    const opponent = await getOrCreateUser(opponentUser.id, interaction.guildId!, opponentUser.username);

    if (wager > 0 && (challenger.coin < wager || opponent.coin < wager)) {
      await interaction.reply({ content: "❌ Cả hai người chơi cần đủ Coin để đặt cược mức này.", ephemeral: true });
      return;
    }

    const [challengerStats, opponentStats] = await Promise.all([
      getTotalStats(challenger.id),
      getTotalStats(opponent.id),
    ]);

    const result = simulateCombat(
      {
        power: challenger.power + challengerStats.powerBonus,
        defense: challenger.defense + challengerStats.defenseBonus,
        hp: challenger.maxHp + challengerStats.hpBonus,
      },
      {
        power: opponent.power + opponentStats.powerBonus,
        defense: opponent.defense + opponentStats.defenseBonus,
        hp: opponent.maxHp + opponentStats.hpBonus,
      }
    );

    const winner = result.win ? challenger : opponent;
    const loser = result.win ? opponent : challenger;
    const winnerName = result.win ? interaction.user.username : opponentUser.username;
    const loserName = result.win ? opponentUser.username : interaction.user.username;

    await prisma.$transaction([
      prisma.user.update({ where: { id: challenger.id }, data: { lastDuel: new Date() } }),
      ...(wager > 0
        ? [
            prisma.user.update({ where: { id: winner.id }, data: { coin: { increment: wager } } }),
            prisma.user.update({ where: { id: loser.id }, data: { coin: { decrement: wager } } }),
          ]
        : []),
    ]);

    if (result.win) await unlockAchievement(challenger.id, "first_duel_win");
    else await unlockAchievement(opponent.id, "first_duel_win");

    const embed = baseEmbed("🗡️ Kết quả PvP", COLORS.warning).setDescription(
      `${interaction.user.username} ⚔️ ${opponentUser.username}\n\n🏆 Người thắng: **${winnerName}**\n💥 Kéo dài ${result.rounds} hiệp` +
        (wager > 0 ? `\n💰 ${winnerName} nhận được ${wager.toLocaleString()} Coin từ ${loserName}` : "")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
