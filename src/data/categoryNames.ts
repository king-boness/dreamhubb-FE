// Category names mapping - FE category names to display names
// FE uses: traveling, health, possessions, relationships, learning, events, profession, other

export const categoryDisplayNames: Record<string, string> = {
  traveling: "Traveling",
  health: "Health",
  possessions: "Possessions",
  relationships: "Relationships",
  learning: "Learning",
  events: "Events",
  profession: "Profession",
  other: "Other"
};

export function getCategoryDisplayName(feCategory: string | null | undefined): string {
  if (!feCategory) return "General";
  return categoryDisplayNames[feCategory] || feCategory.charAt(0).toUpperCase() + feCategory.slice(1);
}
