export function xpNeededForLevel(level: number): number {
  return 100 + level * 50 + level * level * 5;
}

export interface LevelUpResult {
  level: number;
  xp: number;
  power: number;
  defense: number;
  maxHp: number;
  hp: number;
  levelsGained: number;
}

/**
 * Applies XP gain and rolls over as many level-ups as needed.
 * Each level up grants flat stat growth and fully heals the user.
 */
export function applyXpGain(
  current: { level: number; xp: number; power: number; defense: number; maxHp: number; hp: number },
  gainedXp: number
): LevelUpResult {
  let { level, power, defense, maxHp, hp } = current;
  let xp = current.xp + gainedXp;
  let levelsGained = 0;

  while (xp >= xpNeededForLevel(level)) {
    xp -= xpNeededForLevel(level);
    level += 1;
    levelsGained += 1;
    power += 3;
    defense += 2;
    maxHp += 15;
    hp = maxHp;
  }

  return { level, xp, power, defense, maxHp, hp, levelsGained };
}
