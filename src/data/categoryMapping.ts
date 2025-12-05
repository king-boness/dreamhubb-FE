// Mapping between FE category names (from WhatKindOfDream component) and BE category IDs
// FE uses: traveling, health, possessions, relationships, learning, events, profession, other
// BE uses: Všeobecné, Osobný rozvoj, Pomoc ostatným, Tvorba & projekty

export const categoryNameToIdMap: Record<string, number> = {
  // Map FE category names to BE category IDs
  // Note: This is a temporary mapping. In the future, BE should provide category names that match FE
  traveling: 1, // Všeobecné
  health: 2, // Osobný rozvoj
  possessions: 1, // Všeobecné (fallback)
  relationships: 3, // Pomoc ostatným
  learning: 2, // Osobný rozvoj
  events: 1, // Všeobecné (fallback)
  profession: 4, // Tvorba & projekty
  other: 1 // Všeobecné (fallback)
};

export function getCategoryId(categoryName: string | null): number | null {
  if (!categoryName) return null;
  return categoryNameToIdMap[categoryName] || null;
}
