export interface MonsterTier {
  minLevel: number;
  name: string;
  emoji: string;
}

/**
 * Flavor-only checkpoints. Stats are never read off these — they're always
 * computed from the player's own level (see rollBoss/rollDungeon) so combat
 * stays relevant at any level up to MAX_LEVEL (999). Only the name/emoji of
 * the highest tier the player has reached is used.
 */
export const BOSS_TIERS: MonsterTier[] = [
  { minLevel: 1, name: "Goblin Chief", emoji: "👺" },
  { minLevel: 15, name: "Orc Berserker", emoji: "👹" },
  { minLevel: 30, name: "Dark Knight", emoji: "🗡️" },
  { minLevel: 50, name: "Ancient Dragon", emoji: "🐉" },
  { minLevel: 75, name: "Frost Titan", emoji: "❄️" },
  { minLevel: 100, name: "Abyssal Wraith", emoji: "👻" },
  { minLevel: 150, name: "Chaos Warlord", emoji: "⚔️" },
  { minLevel: 200, name: "Void Sovereign", emoji: "👑" },
  { minLevel: 275, name: "Storm Leviathan", emoji: "🌩️" },
  { minLevel: 350, name: "Infernal Colossus", emoji: "🔥" },
  { minLevel: 450, name: "Celestial Judge", emoji: "⚖️" },
  { minLevel: 550, name: "World Serpent", emoji: "🐍" },
  { minLevel: 650, name: "Shadow Emperor", emoji: "🌑" },
  { minLevel: 750, name: "Astral Devourer", emoji: "🌌" },
  { minLevel: 850, name: "Primordial God", emoji: "🌋" },
  { minLevel: 950, name: "Eternity Warden", emoji: "⏳" },
  { minLevel: 999, name: "The Nameless One", emoji: "♾️" },
];

export const DUNGEON_TIERS: MonsterTier[] = [
  { minLevel: 1, name: "Cave Troll", emoji: "🧌" },
  { minLevel: 20, name: "Shadow Lich", emoji: "💀" },
  { minLevel: 45, name: "Void Behemoth", emoji: "👾" },
  { minLevel: 80, name: "Molten Wyrm", emoji: "🌋" },
  { minLevel: 130, name: "Frozen Colossus", emoji: "🧊" },
  { minLevel: 190, name: "Thunder Roc", emoji: "🦅" },
  { minLevel: 260, name: "Blightroot Ent", emoji: "🌳" },
  { minLevel: 350, name: "Obsidian Hydra", emoji: "🐲" },
  { minLevel: 460, name: "Nightmare Chimera", emoji: "🦁" },
  { minLevel: 580, name: "Starfall Wyrm", emoji: "☄️" },
  { minLevel: 720, name: "Doom Kraken", emoji: "🐙" },
  { minLevel: 870, name: "Oblivion Maw", emoji: "🕳️" },
  { minLevel: 999, name: "The Endless Depths", emoji: "🌀" },
];

export interface ScaledMonster {
  name: string;
  emoji: string;
  power: number;
  defense: number;
  hp: number;
  coinReward: [number, number];
  xpReward: [number, number];
}

function currentTier(tiers: MonsterTier[], level: number): MonsterTier {
  let result = tiers[0];
  for (const tier of tiers) {
    if (tier.minLevel <= level) result = tier;
    else break;
  }
  return result;
}

function withVariance(value: number): number {
  return Math.round(value * (0.9 + Math.random() * 0.2));
}

/** Boss fought via /boss — always scaled to the player's own level. */
export function rollBoss(level: number): ScaledMonster {
  const tier = currentTier(BOSS_TIERS, level);
  const L = Math.max(1, level);
  return {
    name: tier.name,
    emoji: tier.emoji,
    hp: withVariance(50 + L * 15),
    power: withVariance(6 + L * 1.8),
    defense: withVariance(3 + L * 1.0),
    coinReward: [Math.round(40 + L * 7), Math.round(100 + L * 18)],
    xpReward: [Math.round(25 + L * 4.5), Math.round(55 + L * 11)],
  };
}

/** Dungeon boss fought via /raid — harder and more rewarding than /boss at the same level. */
export function rollDungeon(level: number): ScaledMonster {
  const tier = currentTier(DUNGEON_TIERS, level);
  const L = Math.max(1, level);
  return {
    name: tier.name,
    emoji: tier.emoji,
    hp: withVariance(70 + L * 22),
    power: withVariance(9 + L * 2.3),
    defense: withVariance(5 + L * 1.4),
    coinReward: [Math.round(70 + L * 11), Math.round(160 + L * 28)],
    xpReward: [Math.round(40 + L * 7), Math.round(90 + L * 17)],
  };
}
