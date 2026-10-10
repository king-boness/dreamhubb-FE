/**
 * Onboarding info modal config.
 *
 * All user-visible text lives in the i18n packs under `onboardingInfo.<group>.<id>.*`
 * (see src/i18n/<locale>/onboarding.ts). This file only keeps key paths and
 * non-translatable ids (icon file keys), so consumers resolve text via `t()`.
 */
export interface InfoConfig {
  titleKey: string;
  highlightKey: string;
  descriptionKey: string;
  ctaLabelKey: string;
  /** SVG file key under /icons/CategoryIcons (non-translatable). */
  iconKey: string;
  /** Quasar icon name. */
  icon?: string;
}

const info = (
  group: "side" | "goal" | "category",
  id: string,
  iconKey: string,
  icon: string
): InfoConfig => {
  const base = `onboardingInfo.${group}.${id}`;
  return {
    titleKey: `${base}.title`,
    highlightKey: `${base}.highlight`,
    descriptionKey: `${base}.description`,
    ctaLabelKey: `${base}.ctaLabel`,
    iconKey,
    icon
  };
};

export const sideInfo: Record<string, InfoConfig> = {
  donor: info("side", "donor", "donors", "favorite"),
  donee: info("side", "donee", "donees", "diamond")
};

export const goalInfo: Record<string, InfoConfig> = {
  dream: info("goal", "dream", "dream", "cloud"),
  problem: info("goal", "problem", "problem", "error_outline"),
  idea: info("goal", "idea", "idea", "lightbulb")
};

export const categoryInfo: Record<string, InfoConfig> = {
  traveling: info("category", "traveling", "travelling", "public"),
  health: info("category", "health", "health", "local_hospital"),
  possessions: info("category", "possessions", "possesions", "home"),
  relationships: info("category", "relationships", "relationships", "favorite"),
  learning: info("category", "learning", "learning", "school"),
  events: info("category", "events", "events", "event"),
  profession: info("category", "profession", "profession", "work"),
  other: info("category", "other", "other", "more_horiz")
};
