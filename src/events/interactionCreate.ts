import { Interaction } from "discord.js";
import { commands } from "../commands";

const commandMap = new Map(commands.map((c) => [c.data.name, c]));

export async function handleInteractionCreate(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.guildId) {
    await interaction.reply({ content: "Lệnh này chỉ dùng được trong server.", ephemeral: true });
    return;
  }

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error executing /${interaction.commandName}:`, err);
    const payload = { content: "❌ Đã xảy ra lỗi khi thực hiện lệnh này.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}
