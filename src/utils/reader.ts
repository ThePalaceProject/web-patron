import SepiaTheme from "../../public/webpub-viewer/SepiaTheme";
import SerifFont from "../../public/webpub-viewer/SerifFont";
import SansFont from "../../public/webpub-viewer/SansFont";
import PublisherFont from "../../public/webpub-viewer/PublisherFont";
import LocalStorageStore from "../../public/webpub-viewer/LocalStorageStore";
import IFrameNavigator from "../../public/webpub-viewer/IFrameNavigator";
import DayTheme from "../../public/webpub-viewer/DayTheme";
import NightTheme from "../../public/webpub-viewer/NightTheme";
import BookSettings from "../../public/webpub-viewer/BookSettings";
import LocalAnnotator from "../../public/webpub-viewer/LocalAnnotator";
import ServiceWorkerCacher from "../../public/webpub-viewer/ServiceWorkerCacher";
import ColumnsPaginatedBookView from "../../public/webpub-viewer/ColumnsPaginatedBookView";
import ScrollingBookView from "../../public/webpub-viewer/ScrollingBookView";
// ( after
export default function () {
  (function (
    LocalStorageStore,
    ServiceWorkerCacher,
    IFrameNavigator,
    PublisherFont,
    SerifFont,
    SansFont,
    DayTheme,
    SepiaTheme,
    NightTheme,
    ColumnsPaginatedBookView,
    ScrollingBookView,
    LocalAnnotator,
    BookSettings
  ) {
    const element = document.getElementById("viewer");
    const webpubManifestUrl = new URL(
      /* this manifest url should be dynamic */
      "/alice/manifest.json",
      window.location.href
    );
    const store = new LocalStorageStore({
      prefix: webpubManifestUrl.href
    });
    const cacher = new ServiceWorkerCacher({
      store: store,
      manifestUrl: webpubManifestUrl,
      serviceWorkerUrl: new URL("sw.js", window.location.href),
      staticFileUrls: [
        new URL(window.location.href),
        new URL("index.html", window.location.href),
        new URL("main.css", window.location.href),
        new URL("require.js", window.location.href),
        new URL("fetch.js", window.location.href),
        new URL("webpub-viewer.js", window.location.href)
      ]
    });
    const publisher = new PublisherFont();
    const serif = new SerifFont();
    const sans = new SansFont();
    const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
    const FontSize = 20;
    const day = new DayTheme();
    const sepia = new SepiaTheme();
    const night = new NightTheme();
    const paginator = new ColumnsPaginatedBookView();
    const scroller = new ScrollingBookView();
    const annotator = new LocalAnnotator({ store: store });
    const settingsStore = new LocalStorageStore({
      prefix: "webpub-viewer"
    });
    const upLink = {
      url: new URL("https://github.com/NYPL-Simplified/webpub-viewer"),
      label: "My Library",
      ariaLabel: "Go back to the Github repository"
    };
    BookSettings.create({
      store: settingsStore,
      bookFonts: [publisher, serif, sans],
      fontSizesInPixels: fontSizes,
      //      FontSizeInPixels: FontSize,
      bookThemes: [day, sepia, night],
      bookViews: [paginator, scroller]
    }).then(function (settings) {
      IFrameNavigator.create({
        element: element,
        manifestUrl: webpubManifestUrl,
        store: store,
        cacher: cacher,
        settings: settings,
        annotator: annotator,
        publisher: publisher,
        serif: serif,
        sans: sans,
        day: day,
        sepia: sepia,
        night: night,
        paginator: paginator,
        scroller: scroller,
        upLink: upLink,
        allowFullscreen: true
      });
    });
  })(
    LocalStorageStore,
    ServiceWorkerCacher,
    IFrameNavigator,
    PublisherFont,
    SerifFont,
    SansFont,
    DayTheme,
    SepiaTheme,
    NightTheme,
    ColumnsPaginatedBookView,
    ScrollingBookView,
    LocalAnnotator,
    BookSettings
  );
} //); //();
