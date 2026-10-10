import auth from "./auth";
import feed from "./feed";
import common from "./common";
import subcategories from "./subcategories";
import legal from "./legal";
import onboarding from "./onboarding";
import notifications from "./notifications";
import settings from "./settings";
import posts from "./posts";
import profile from "./profile";

export default {
  ...auth,
  ...feed,
  ...common,
  common,
  ...subcategories,
  subcategories,
  ...legal,
  ...onboarding,
  ...notifications,
  ...settings,
  ...posts,
  ...profile
};
