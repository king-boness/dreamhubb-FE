import auth from "./auth";
import common from "./common";
import subcategories from "./subcategories";

export default {
  ...auth,
  ...common,
  ...subcategories,
  common,
  subcategories
};
