import { Client } from "discord.js";
import { getOrCreateUser } from "../lib/user";
import { prisma } from "../lib/prisma";
import { applyXpGain } from "../lib/xp";
import { incrementQuest } from "../lib/quest";
import { checkMilestoneAchievements } from "../lib/achievements";
import { COOLDOWNS } from "../lib/cooldown";

const VOICE_TICK_MINUTES = COOLDOWNS.voiceXp / 60000;

export async function runVoiceXpTick(client: Client) {
  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isVoiceBased() || channel.id === guild.afkChannelId) continue;

      for (const member of channel.members.values()) {
        if (member.user.bot) continue;
        if (member.voice.selfDeaf || member.voice.deaf) continue;

        try {
          const user = await getOrCreateUser(member.id, guild.id, member.user.username);
          const xpGain = 20;
          const coinGain = 10;
          const leveled = applyXpGain(user, xpGain);

          const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
              coin: user.coin + coinGain,
              lastVoiceXp: new Date(),
              level: leveled.level,
              xp: leveled.xp,
              power: leveled.power,
              defense: leveled.defense,
              maxHp: leveled.maxHp,
              hp: leveled.hp,
            },
          });

          await incrementQuest(user.id, "voiceMinutes", VOICE_TICK_MINUTES);
          if (leveled.levelsGained > 0) await checkMilestoneAchievements(updated);
        } catch (err) {
          console.error("voiceXpTick error for member", member.id, err);
        }
      }
    }
  }
}
