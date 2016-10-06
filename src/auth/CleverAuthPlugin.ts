import AuthPlugin from "opds-web-client/lib/AuthPlugin";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import CleverButton from "./components/CleverButton";

const CleverAuthPlugin: AuthPlugin = {
  type: "http://librarysimplified.org/authtype/Clever",

  lookForCredentials: () => {
    // Check for Clever auth
    let isServer = (typeof window === "undefined");
    if (!isServer) {
      let accessTokenKey = "access_token=";
      let errorKey = "error=";
      if (window && window.location && window.location.hash) {
        if (window.location.hash.indexOf(accessTokenKey) !== -1) {
          let hash = window.location.hash;
          let accessTokenStart = hash.indexOf(accessTokenKey);
          let accessToken = hash.slice(accessTokenStart + accessTokenKey.length).split("&")[0];
          let credentials = { provider: "Clever", credentials: "Bearer " + accessToken };
          new DataFetcher().setAuthCredentials(credentials);
          window.location.hash = "";
        } else if (window.location.hash.indexOf(errorKey) !== -1) {
          let hash = window.location.hash;
          let errorStart = hash.indexOf(errorKey);
          let error = hash.slice(errorStart + errorKey.length).split("&")[0];
          let problemDetail = JSON.parse(decodeURIComponent(error.replace(/\+/g, "%20")));
          window.location.hash = "";
          return problemDetail.title;
        }
      }
    }
  },

  formComponent: null,
  buttonComponent: CleverButton
};

export = CleverAuthPlugin;