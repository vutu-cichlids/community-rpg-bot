import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_DEV_GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID must be set");
}

const body = commands.map((c) => c.data.toJSON());
const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  const route = guildId ? Routes.applicationGuildCommands(clientId!, guildId) : Routes.applicationCommands(clientId!);
  const scope = guildId ? `guild ${guildId}` : "global";
  console.log(`Registering ${body.length} slash commands (${scope})...`);
  await rest.put(route, { body });
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
