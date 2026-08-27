/**
 * Returns milliseconds remaining on a cooldown, or 0 if it has expired / was never set.
 */
export function remainingCooldown(last: Date | null | undefined, cooldownMs: number): number {
  if (!last) return 0;
  const elapsed = Date.now() - last.getTime();
  return Math.max(0, cooldownMs - elapsed);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

export const COOLDOWNS = {
  daily: 24 * 60 * 60 * 1000,
  work: 30 * 60 * 1000,
  boss: 60 * 1000,
  raid: 10 * 60 * 1000,
  duel: 60 * 1000,
  messageXp: 60 * 1000,
  voiceXp: 5 * 60 * 1000,
};
