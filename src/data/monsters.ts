export interface MonsterDef {
  name: string;
  emoji: string;
  minLevel: number;
  power: number;
  defense: number;
  hp: number;
  coinReward: [number, number];
  xpReward: [number, number];
}

export const BOSSES: MonsterDef[] = [
  {
    name: "Goblin Chief",
    emoji: "👺",
    minLevel: 1,
    power: 8,
    defense: 4,
    hp: 60,
    coinReward: [50, 120],
    xpReward: [30, 60],
  },
  {
    name: "Orc Berserker",
    emoji: "👹",
    minLevel: 5,
    power: 16,
    defense: 8,
    hp: 120,
    coinReward: [100, 220],
    xpReward: [60, 110],
  },
  {
    name: "Dark Knight",
    emoji: "🗡️",
    minLevel: 12,
    power: 28,
    defense: 16,
    hp: 220,
    coinReward: [200, 400],
    xpReward: [120, 200],
  },
  {
    name: "Ancient Dragon",
    emoji: "🐉",
    minLevel: 20,
    power: 45,
    defense: 25,
    hp: 400,
    coinReward: [400, 800],
    xpReward: [220, 380],
  },
];

export const DUNGEONS: MonsterDef[] = [
  {
    name: "Cave Troll",
    emoji: "🧌",
    minLevel: 3,
    power: 14,
    defense: 10,
    hp: 150,
    coinReward: [150, 300],
    xpReward: [80, 140],
  },
  {
    name: "Shadow Lich",
    emoji: "💀",
    minLevel: 10,
    power: 26,
    defense: 14,
    hp: 300,
    coinReward: [300, 550],
    xpReward: [160, 260],
  },
  {
    name: "Void Behemoth",
    emoji: "👾",
    minLevel: 18,
    power: 40,
    defense: 22,
    hp: 550,
    coinReward: [550, 1000],
    xpReward: [280, 450],
  },
];

export function pickMonster(list: MonsterDef[], level: number): MonsterDef {
  const eligible = list.filter((m) => m.minLevel <= level + 3);
  const pool = eligible.length > 0 ? eligible : [list[0]];
  return pool[Math.floor(Math.random() * pool.length)];
}
