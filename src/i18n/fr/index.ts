import auth from "./auth";
import feed from "./feed";
import common from "./common";
import subcategories from "./subcategories";
import legal from "./legal";
import notifications from "./notifications";
import posts from "./posts";
import onboarding from "./onboarding";
import settings from "./settings";
import profile from "./profile";

export default {
  ...auth,
  ...feed,
  ...common,
  common,
  ...subcategories,
  subcategories,
  ...legal,
  ...notifications,
  ...posts,
  ...onboarding,
  ...settings,
  ...profile
};
