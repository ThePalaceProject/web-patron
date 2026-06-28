import type { AppConfig } from "interfaces";
import { DEFAULT_ITEM_LANDING_SLUG } from "constants/app";

const FALLBACK_APP_CONFIG: AppConfig = {
  instanceName: "",
  mediaSupport: {},
  companionApp: "simplye",
  showMedium: true,
  bugsnagApiKey: null,
  openebooks: null,
  authenticationDocuments: null,
  itemLandingSlugs: [DEFAULT_ITEM_LANDING_SLUG]
};

export default FALLBACK_APP_CONFIG;
