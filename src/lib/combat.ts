export interface Combatant {
  power: number;
  defense: number;
  hp: number;
}

export interface CombatResult {
  win: boolean;
  playerDamageTaken: number;
  rounds: number;
}

/**
 * Simple turn-based simulation: each round both sides deal randomized damage
 * based on power minus a fraction of the opponent's defense. Runs until one
 * side's HP is depleted or a round cap is hit (treated as a loss for the player).
 */
export function simulateCombat(player: Combatant, enemy: Combatant): CombatResult {
  let playerHp = player.hp;
  let enemyHp = enemy.hp;
  let rounds = 0;
  let playerDamageTaken = 0;
  const maxRounds = 30;

  while (playerHp > 0 && enemyHp > 0 && rounds < maxRounds) {
    rounds += 1;

    const playerDmg = Math.max(1, Math.round(player.power * (0.85 + Math.random() * 0.3) - enemy.defense * 0.4));
    enemyHp -= playerDmg;
    if (enemyHp <= 0) break;

    const enemyDmg = Math.max(1, Math.round(enemy.power * (0.85 + Math.random() * 0.3) - player.defense * 0.4));
    playerHp -= enemyDmg;
    playerDamageTaken += enemyDmg;
  }

  return { win: enemyHp <= 0 && playerHp > 0, playerDamageTaken, rounds };
}

export function randomInRange([min, max]: [number, number]): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
