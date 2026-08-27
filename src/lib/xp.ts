export const MAX_LEVEL = 999;

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
 * Growth stops at MAX_LEVEL — further XP is simply not banked.
 */
export function applyXpGain(
  current: { level: number; xp: number; power: number; defense: number; maxHp: number; hp: number },
  gainedXp: number
): LevelUpResult {
  let { level, power, defense, maxHp, hp } = current;

  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, xp: 0, power, defense, maxHp, hp, levelsGained: 0 };
  }

  let xp = current.xp + gainedXp;
  let levelsGained = 0;

  while (level < MAX_LEVEL && xp >= xpNeededForLevel(level)) {
    xp -= xpNeededForLevel(level);
    level += 1;
    levelsGained += 1;
    power += 3;
    defense += 2;
    maxHp += 15;
    hp = maxHp;
  }

  if (level >= MAX_LEVEL) {
    level = MAX_LEVEL;
    xp = 0;
  }

  return { level, xp, power, defense, maxHp, hp, levelsGained };
}
