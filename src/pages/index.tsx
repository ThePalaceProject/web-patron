import * as React from "react";
import { APP_CONFIG } from "utils/env";
import OpenEbooksLandingPage, {
  landingPageStaticPaths,
  landingPageStaticProps
} from "components/OpenEbooksLanding";

const HomePage =
  APP_CONFIG.companionApp === "openebooks" ? OpenEbooksLandingPage : () => null;

export const getStaticProps =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticProps : undefined;
export const getStaticPaths =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticPaths : undefined;

export default HomePage;
