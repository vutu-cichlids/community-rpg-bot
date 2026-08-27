export interface PetSpeciesDef {
  species: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  basePower: number;
  weight: number;
}

export const PET_SPECIES: PetSpeciesDef[] = [
  { species: "Cat", emoji: "🐱", rarity: "common", basePower: 4, weight: 35 },
  { species: "Dog", emoji: "🐶", rarity: "common", basePower: 5, weight: 35 },
  { species: "Fox", emoji: "🦊", rarity: "rare", basePower: 8, weight: 15 },
  { species: "Wolf", emoji: "🐺", rarity: "rare", basePower: 9, weight: 10 },
  { species: "Panda", emoji: "🐼", rarity: "epic", basePower: 14, weight: 4 },
  { species: "Robot", emoji: "🤖", rarity: "epic", basePower: 15, weight: 3 },
  { species: "Dragon", emoji: "🐉", rarity: "legendary", basePower: 25, weight: 1.5 },
  { species: "Alien", emoji: "👾", rarity: "legendary", basePower: 26, weight: 1.5 },
];

export function rollPetSpecies(): PetSpeciesDef {
  const totalWeight = PET_SPECIES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const p of PET_SPECIES) {
    if (roll < p.weight) return p;
    roll -= p.weight;
  }
  return PET_SPECIES[0];
}
