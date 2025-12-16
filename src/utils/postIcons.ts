/**
 * Get post type icon path
 * @param type - Post type: "dream", "problem", "idea"
 * @returns Path to the icon file in public/post_icons
 */
export const getPostTypeIcon = (type: string | null | undefined): string => {
  const typeMap: Record<string, string> = {
    dream: "/post_icons/dream_mini.svg",
    problem: "/post_icons/problem_mini.svg",
    idea: "/post_icons/idea_mini.svg"
  };
  return typeMap[type?.toLowerCase() || ""] || "/post_icons/dream_mini.svg";
};
