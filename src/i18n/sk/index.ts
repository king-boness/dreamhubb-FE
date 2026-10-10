import auth from "./auth";
import common from "./common";
import feed from "./feed";
import legal from "./legal";
import notifications from "./notifications";
import onboarding from "./onboarding";
import posts from "./posts";
import profile from "./profile";
import settings from "./settings";
import subcategories from "./subcategories";

export default {
  ...auth,
  ...common,
  ...feed,
  ...legal,
  ...notifications,
  ...onboarding,
  ...posts,
  ...profile,
  ...settings,
  ...subcategories,
  common,
  subcategories
};
