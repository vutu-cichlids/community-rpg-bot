import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";
import { getOrCreateUser } from "../lib/user";
import { CLASSES, getClass } from "../data/classes";
import { baseEmbed, COLORS } from "../lib/embeds";
import { prisma } from "../lib/prisma";
import { unlockAchievement } from "../lib/achievements";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("class")
    .setDescription("Xem hoặc chọn class cho nhân vật")
    .addStringOption((opt) =>
      opt
        .setName("choose")
        .setDescription("Chọn class (chỉ có thể chọn 1 lần)")
        .addChoices(...CLASSES.map((c) => ({ name: `${c.emoji} ${c.name}`, value: c.id })))
    ),

  async execute(interaction) {
    const choice = interaction.options.getString("choose");
    const user = await getOrCreateUser(interaction.user.id, interaction.guildId!, interaction.user.username);

    if (!choice) {
      const embed = baseEmbed("🎭 Các class khả dụng", COLORS.primary).setDescription(
        CLASSES.map(
          (c) => `${c.emoji} **${c.name}** — ${c.description}\n  Power +${c.power} | Defense +${c.defense} | HP +${c.hp}`
        ).join("\n\n") + (user.classId ? `\n\nClass hiện tại: **${getClass(user.classId)?.name}**` : "\n\nDùng `/class choose` để chọn class.")
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (user.classId) {
      await interaction.reply({
        content: `⚠️ Bạn đã chọn class **${getClass(user.classId)?.name}** rồi, không thể đổi.`,
        ephemeral: true,
      });
      return;
    }

    const def = getClass(choice);
    if (!def) {
      await interaction.reply({ content: "Class không hợp lệ.", ephemeral: true });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        classId: def.id,
        power: user.power + def.power,
        defense: user.defense + def.defense,
        maxHp: user.maxHp + def.hp,
        hp: user.maxHp + def.hp,
      },
    });

    await unlockAchievement(user.id, "first_class");

    const embed = baseEmbed("✅ Đã chọn class!", COLORS.success).setDescription(
      `Bạn đã trở thành ${def.emoji} **${def.name}**!\n\n⚔️ Power: ${updated.power}\n🛡️ Defense: ${updated.defense}\n❤️ HP: ${updated.hp}/${updated.maxHp}`
    );
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
