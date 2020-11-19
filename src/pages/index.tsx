import * as React from "react";
import { APP_CONFIG } from "utils/env";
import OpenEbooksLandingPage, {
  landingPageStaticPaths,
  landingPageStaticProps
} from "components/OpenEbooksLanding";
import ErrorComponent from "components/Error";

const HomePage =
  APP_CONFIG.companionApp === "openebooks"
    ? OpenEbooksLandingPage
    : ErrorComponent;

export const getStaticProps =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticProps : undefined;
export const getStaticPaths =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticPaths : undefined;

export default HomePage;
