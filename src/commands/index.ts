import { Command } from "./types";

import profile from "./profile";
import classCmd from "./class";
import daily from "./daily";
import work from "./work";
import shop from "./shop";
import buy from "./buy";
import inventory from "./inventory";
import equip from "./equip";
import use from "./use";
import boss from "./boss";
import raid from "./raid";
import duel from "./duel";
import chest from "./chest";
import pet from "./pet";
import clan from "./clan";
import quest from "./quest";
import achievements from "./achievements";
import leaderboard from "./leaderboard";
import slot from "./slot";
import dice from "./dice";
import gift from "./gift";
import help from "./help";

export const commands: Command[] = [
  profile,
  classCmd,
  daily,
  work,
  shop,
  buy,
  inventory,
  equip,
  use,
  boss,
  raid,
  duel,
  chest,
  pet,
  clan,
  quest,
  achievements,
  leaderboard,
  slot,
  dice,
  gift,
  help,
];
