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
      if (window && window.location && window.location.hash && window.location.hash.indexOf(accessTokenKey) !== -1) {
        let hash = window.location.hash;
        let accessTokenStart = hash.indexOf(accessTokenKey);
        let accessToken = hash.slice(accessTokenStart + accessTokenKey.length).split("&")[0];
        let credentials = "Bearer " + accessToken;
        new DataFetcher().setAuthCredentials({ provider: "Clever", credentials: credentials });
        window.location.hash = "";
      }
    }
  },

  formComponent: null,
  buttonComponent: CleverButton
};

export = CleverAuthPlugin;