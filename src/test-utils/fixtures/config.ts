import { AppConfig, FirebaseConfig } from "interfaces";
import { DEFAULT_ITEM_LANDING_SLUG } from "constants/app";

export const config: AppConfig = {
  instanceName: "Test Instance",
  bugsnagApiKey: null,
  companionApp: "simplye",
  showMedium: true,
  enableOpds2: false,
  enableLanguageSelector: false,
  enablePinning: true,
  firebaseAnalytics: { enable: false, config: null },
  openebooks: null,
  authenticationDocuments: null,
  itemLandingSlugs: [DEFAULT_ITEM_LANDING_SLUG],
  mediaSupport: {
    "application/epub+zip": "show",
    "application/kepub+zip": "show",
    "application/pdf": "show",
    "application/x-mobipocket-ebook": "show",
    "application/x-mobi8-ebook": "show",
    "application/vnd.overdrive.circulation.api+json;profile=ebook": "show",
    // # External read online type (Like Overdrive)
    'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"':
      "show",
    // # AxisNow document (read online in Webpub Viewer)
    "application/vnd.librarysimplified.axisnow+json": "show",
    // # Audiobooks
    "application/audiobook+json": "redirect",
    "application/vnd.overdrive.circulation.api+json;profile=audiobook":
      "redirect",
    // # INDIRECT TYPES
    // # OPDS Entry Indirection type
    "application/atom+xml;type=entry;profile=opds-catalog": {
      'text/html;profile="http://librarysimplified.org/terms/profiles/streaming-media"':
        "show"
    },
    // # Adobe Encryption
    "application/vnd.adobe.adept+xml": {
      "application/epub+zip": "redirect-and-show"
    },
    // # Bearer Token Exchange
    "application/vnd.librarysimplified.bearer-token+json": {
      "application/pdf": "redirect"
    }
  }
};

export const firebaseConfig: FirebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test.firebaseapp.com",
  projectId: "test-project",
  storageBucket: "test.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef",
  measurementId: "G-TESTID"
};
