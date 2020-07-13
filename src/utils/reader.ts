import {
  SepiaTheme,
  SerifFont,
  SansFont,
  PublisherFont,
  LocalStorageStore,
  IFrameNavigator,
  DayTheme,
  NightTheme,
  BookSettings,
  LocalAnnotator,
  ServiceWorkerCacher,
  ColumnsPaginatedBookView,
  ScrollingBookView
} from "library-simplified-webpub-viewer";

export default async function (bookUrl: string) {
  const element = document.getElementById("viewer");
  const webpubBookUrl = new URL(bookUrl, window.location.href);
  const containerHref = webpubBookUrl.href.endsWith("container.xml")
    ? webpubBookUrl.href
    : "";
  function webpubManifestUrl() {
    return new Promise((resolve, reject) => {
      window
        .fetch(containerHref)
        .then(response => response.text())
        .then(text => new window.DOMParser().parseFromString(text, "text/html"))
        .then(xml =>
          xml.getElementsByTagName("rootfile")[0]
            ? xml.getElementsByTagName("rootfile")[0].getAttribute("full-path")
            : ""
        )
        .then(rootfile => {
          const url = containerHref.replace(
            "META-INF/container.xml",
            rootfile || ""
          );

          return resolve(rootfile ? new URL(url) : webpubBookUrl);
        })
        .catch(err => reject(err));
    });
  }

  webpubManifestUrl().then(url => initBookSettings(element, url));
}

function initBookSettings(element, webpubManifestUrl) {
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

  const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32];
  const annotator = new LocalAnnotator({ store: store });
  const settingsStore = new LocalStorageStore({
    prefix: "webpub-viewer"
  });
  const upLink = {
    url: new URL("https://github.com/NYPL-Simplified/webpub-viewer"),
    label: "My Library",
    ariaLabel: "Go back to the Github repository"
  };
  const publisher = new PublisherFont();
  const serif = new SerifFont();
  const sans = new SansFont();
  const day = new DayTheme();
  const sepia = new SepiaTheme();
  const night = new NightTheme();
  const paginator = new ColumnsPaginatedBookView();
  const scroller = new ScrollingBookView();
  BookSettings.create({
    store: settingsStore,
    bookFonts: [publisher, serif, sans],
    fontSizesInPixels: fontSizes,
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
}
