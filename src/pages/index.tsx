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
    : () => (
        <ErrorComponent
          info={{
            title: "Page Not Found",
            status: 404,
            detail:
              "This app does not have a home page. Url should contain a library slug: https://domain.com/<library>"
          }}
        />
      );

export const getStaticProps =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticProps : undefined;
export const getStaticPaths =
  APP_CONFIG.companionApp === "openebooks" ? landingPageStaticPaths : undefined;

export default HomePage;
