export interface ClassDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  power: number;
  defense: number;
  hp: number;
}

export const CLASSES: ClassDef[] = [
  {
    id: "warrior",
    name: "Warrior",
    emoji: "⚔️",
    description: "Cận chiến cân bằng, dễ chơi cho người mới.",
    power: 5,
    defense: 5,
    hp: 20,
  },
  {
    id: "archer",
    name: "Archer",
    emoji: "🏹",
    description: "Sát thương cao, máu và phòng thủ thấp hơn.",
    power: 8,
    defense: 2,
    hp: 10,
  },
  {
    id: "mage",
    name: "Mage",
    emoji: "🧙",
    description: "Sát thương phép cao nhất nhưng cực kỳ mỏng manh.",
    power: 10,
    defense: 0,
    hp: 5,
  },
  {
    id: "assassin",
    name: "Assassin",
    emoji: "🗡️",
    description: "Sát thương cao, tốc độ, PvP mạnh.",
    power: 9,
    defense: 1,
    hp: 8,
  },
  {
    id: "tank",
    name: "Tank",
    emoji: "🛡️",
    description: "Phòng thủ và máu vượt trội, sát thương thấp.",
    power: 2,
    defense: 10,
    hp: 30,
  },
  {
    id: "support",
    name: "Support",
    emoji: "❤️",
    description: "Cân bằng, thiên về phòng thủ và trợ lực.",
    power: 3,
    defense: 6,
    hp: 15,
  },
];

export function getClass(id: string): ClassDef | undefined {
  return CLASSES.find((c) => c.id === id);
}
