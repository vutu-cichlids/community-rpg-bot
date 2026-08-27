import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { commands } from "./commands";
import { handleInteractionCreate } from "./events/interactionCreate";
import { handleMessageCreate } from "./events/messageCreate";
import { runVoiceXpTick } from "./events/voiceXpTick";
import { COOLDOWNS } from "./lib/cooldown";
import { prisma } from "./lib/prisma";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const devGuildId = process.env.DISCORD_DEV_GUILD_ID;

if (!token || !clientId) {
  throw new Error("DISCORD_TOKEN and DISCORD_CLIENT_ID environment variables are required.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token!);
  const body = commands.map((c) => c.data.toJSON());
  const route = devGuildId ? Routes.applicationGuildCommands(clientId!, devGuildId) : Routes.applicationCommands(clientId!);
  await rest.put(route, { body });
  console.log(`Registered ${body.length} slash commands (${devGuildId ? `guild ${devGuildId}` : "global"}).`);
}

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  try {
    await registerCommands();
  } catch (err) {
    console.error("Failed to register slash commands:", err);
  }
  setInterval(() => {
    runVoiceXpTick(client).catch((err) => console.error("voiceXpTick failed:", err));
  }, COOLDOWNS.voiceXp);
});

client.on("interactionCreate", handleInteractionCreate);
client.on("messageCreate", handleMessageCreate);

async function shutdown() {
  console.log("Shutting down...");
  await prisma.$disconnect();
  client.destroy();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

client.login(token);
