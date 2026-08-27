import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { getOrResetQuest, isQuestComplete, QUEST_TARGETS } from "../lib/quest";
import { applyXpGain } from "../lib/xp";
import { baseEmbed, COLORS } from "../lib/embeds";
import { checkMilestoneAchievements, unlockAchievement } from "../lib/achievements";

function checkbox(current: number, target: number): string {
  return current >= target ? "✅" : "⬜";
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("quest")
    .setDescription("Nhiệm vụ hàng ngày")
    .addSubcommand((sub) => sub.setName("view").setDescription("Xem tiến độ nhiệm vụ hôm nay"))
    .addSubcommand((sub) => sub.setName("claim").setDescription("Nhận thưởng khi hoàn thành tất cả nhiệm vụ")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);
    const quest = await getOrResetQuest(user.id);

    if (sub === "view") {
      const embed = baseEmbed("📜 Daily Quest", COLORS.primary).setDescription(
        `${checkbox(quest.messages, QUEST_TARGETS.messages)} Gửi ${QUEST_TARGETS.messages} tin nhắn (${quest.messages}/${QUEST_TARGETS.messages})\n` +
          `${checkbox(quest.voiceMinutes, QUEST_TARGETS.voiceMinutes)} Vào Voice ${QUEST_TARGETS.voiceMinutes} phút (${quest.voiceMinutes}/${QUEST_TARGETS.voiceMinutes})\n` +
          `${checkbox(quest.minigames, QUEST_TARGETS.minigames)} Chơi ${QUEST_TARGETS.minigames} mini game (${quest.minigames}/${QUEST_TARGETS.minigames})\n\n` +
          (quest.claimed ? "🎁 Đã nhận thưởng hôm nay." : isQuestComplete(quest) ? "✅ Đã hoàn thành! Dùng `/quest claim`." : "Tiếp tục hoạt động để hoàn thành nhiệm vụ.")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (quest.claimed) {
      await interaction.reply({ content: "🎁 Bạn đã nhận thưởng nhiệm vụ hôm nay rồi.", ephemeral: true });
      return;
    }
    if (!isQuestComplete(quest)) {
      await interaction.reply({ content: "❌ Bạn chưa hoàn thành hết nhiệm vụ hôm nay. Dùng `/quest view` để xem tiến độ.", ephemeral: true });
      return;
    }

    const coinGain = 2000;
    const xpGain = 500;
    const leveled = applyXpGain(user, xpGain);
    const newStreak = user.questStreak + 1;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        coin: user.coin + coinGain,
        questStreak: newStreak,
        level: leveled.level,
        xp: leveled.xp,
        power: leveled.power,
        defense: leveled.defense,
        maxHp: leveled.maxHp,
        hp: leveled.hp,
      },
    });
    await prisma.questProgress.update({ where: { userId: user.id }, data: { claimed: true } });

    const unlocked = await checkMilestoneAchievements(updated);
    if (newStreak >= 7) {
      const a = await unlockAchievement(user.id, "quest_streak_7");
      if (a) unlocked.push(a);
    }

    const embed = baseEmbed("🎉 Nhiệm vụ hoàn thành!", COLORS.gold).setDescription(
      `💰 +${coinGain.toLocaleString()} Coin\n⭐ +${xpGain} XP\n📜 Quest streak: ${newStreak}` +
        (leveled.levelsGained > 0 ? `\n\n🎉 Lên **Level ${leveled.level}**!` : "") +
        (unlocked.length > 0 ? `\n\n🏆 Mở khóa: ${unlocked.map((a) => `${a.emoji} ${a.name}`).join(", ")}` : "")
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
