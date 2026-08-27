export type ItemType = "weapon" | "armor" | "consumable" | "misc";

export interface ItemDef {
  id: string;
  name: string;
  emoji: string;
  type: ItemType;
  price: number;
  powerBonus: number;
  defenseBonus: number;
  hpBonus: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
}

export const ITEMS: ItemDef[] = [
  {
    id: "wooden_sword",
    name: "Wooden Sword",
    emoji: "🗡️",
    type: "weapon",
    price: 150,
    powerBonus: 3,
    defenseBonus: 0,
    hpBonus: 0,
    rarity: "common",
    description: "Vũ khí khởi đầu, tăng nhẹ sức mạnh.",
  },
  {
    id: "iron_sword",
    name: "Iron Sword",
    emoji: "⚔️",
    type: "weapon",
    price: 600,
    powerBonus: 8,
    defenseBonus: 0,
    hpBonus: 0,
    rarity: "rare",
    description: "Kiếm sắt chắc chắn, sát thương ổn định.",
  },
  {
    id: "dragon_blade",
    name: "Dragon Blade",
    emoji: "🐉",
    type: "weapon",
    price: 3000,
    powerBonus: 20,
    defenseBonus: 2,
    hpBonus: 0,
    rarity: "epic",
    description: "Lưỡi kiếm rèn từ vảy rồng cổ đại.",
  },
  {
    id: "leather_armor",
    name: "Leather Armor",
    emoji: "🦺",
    type: "armor",
    price: 150,
    powerBonus: 0,
    defenseBonus: 3,
    hpBonus: 10,
    rarity: "common",
    description: "Giáp da nhẹ, dễ tiếp cận.",
  },
  {
    id: "iron_armor",
    name: "Iron Armor",
    emoji: "🛡️",
    type: "armor",
    price: 600,
    powerBonus: 0,
    defenseBonus: 8,
    hpBonus: 25,
    rarity: "rare",
    description: "Giáp sắt bảo vệ tốt hơn trong chiến đấu.",
  },
  {
    id: "ancient_shield",
    name: "Ancient Shield",
    emoji: "🛡️",
    type: "armor",
    price: 3000,
    powerBonus: 2,
    defenseBonus: 18,
    hpBonus: 60,
    rarity: "epic",
    description: "Khiên cổ đại gần như bất khả xâm phạm.",
  },
  {
    id: "health_potion",
    name: "Health Potion",
    emoji: "🧪",
    type: "consumable",
    price: 80,
    powerBonus: 0,
    defenseBonus: 0,
    hpBonus: 0,
    rarity: "common",
    description: "Hồi phục HP về tối đa khi dùng.",
  },
  {
    id: "mystery_chest",
    name: "Mystery Chest",
    emoji: "🎁",
    type: "misc",
    price: 500,
    powerBonus: 0,
    defenseBonus: 0,
    hpBonus: 0,
    rarity: "rare",
    description: "Rương bí ẩn, mở ra bằng lệnh /chest open.",
  },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}
