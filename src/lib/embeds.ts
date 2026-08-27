import { EmbedBuilder } from "discord.js";

export const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
  gold: 0xf1c40f,
};

export function baseEmbed(title: string, color: number = COLORS.primary): EmbedBuilder {
  return new EmbedBuilder().setTitle(title).setColor(color).setTimestamp();
}
