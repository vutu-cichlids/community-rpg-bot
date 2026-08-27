export interface AchievementDef {
  key: string;
  name: string;
  emoji: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first_class", name: "New Adventurer", emoji: "🌱", description: "Chọn class lần đầu tiên." },
  { key: "level_10", name: "Rising Star", emoji: "⭐", description: "Đạt Level 10." },
  { key: "level_25", name: "Veteran", emoji: "🏅", description: "Đạt Level 25." },
  { key: "level_50", name: "Legend", emoji: "👑", description: "Đạt Level 50." },
  { key: "level_100", name: "Champion", emoji: "🏆", description: "Đạt Level 100." },
  { key: "level_250", name: "Mythic", emoji: "🔱", description: "Đạt Level 250." },
  { key: "level_500", name: "Ascended", emoji: "🌠", description: "Đạt Level 500." },
  { key: "level_999", name: "Transcendent", emoji: "♾️", description: "Đạt Level 999 — cấp tối đa." },
  { key: "first_boss", name: "Boss Slayer", emoji: "⚔️", description: "Đánh bại boss đầu tiên." },
  { key: "first_raid", name: "Dungeon Crawler", emoji: "🧌", description: "Hoàn thành raid dungeon đầu tiên." },
  { key: "first_duel_win", name: "Duelist", emoji: "🗡️", description: "Thắng trận PvP đầu tiên." },
  { key: "first_pet", name: "Pet Owner", emoji: "🐾", description: "Nhận nuôi pet đầu tiên." },
  { key: "first_clan", name: "Guild Member", emoji: "🏰", description: "Tham gia clan đầu tiên." },
  { key: "rich_10k", name: "Wealthy", emoji: "💰", description: "Sở hữu 10,000 Coin." },
  { key: "rich_100k", name: "Millionaire Path", emoji: "💎", description: "Sở hữu 100,000 Coin." },
  { key: "quest_streak_7", name: "Dedicated", emoji: "📜", description: "Hoàn thành daily quest 7 ngày liên tiếp." },
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
