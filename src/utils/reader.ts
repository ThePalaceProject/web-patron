import {
  SepiaTheme,
  SerifFont,
  SansFont,
  PublisherFont,
  DyslexiaFont,
  LocalStorageStore,
  IFrameNavigator,
  DayTheme,
  NightTheme,
  BookSettings,
  LocalAnnotator,
  ServiceWorkerCacher,
  ColumnsPaginatedBookView,
  ScrollingBookView
} from "@thepalaceproject/webpub-viewer/dist/webpub-viewer";
import fetchWithHeaders from "dataflow/fetch";
import Decryptor from "@nypl-simplified-packages/axisnow-access-control-web";
import ApplicationError from "errors";

export default async function reader(
  bookUrl: string,
  token: string,
  catalogName: string,
  decryptorParams?: any
) {
  const element = document.getElementById("viewer");
  const webpubBookUrl = new URL(bookUrl, window.location.href);
  const containerHref = webpubBookUrl.href.endsWith("container.xml")
    ? webpubBookUrl.href
    : "";
  const response = await fetchWithHeaders(containerHref, token);
  const text = await response.text();
  const xml = new window.DOMParser().parseFromString(text, "text/html");
  const rootfile = xml.getElementsByTagName("rootfile")[0]
    ? xml.getElementsByTagName("rootfile")[0].getAttribute("full-path")
    : "";
  const url = containerHref.replace("META-INF/container.xml", rootfile || "");
  const finalUrl = rootfile ? new URL(url) : webpubBookUrl;

  initBookSettings(element, finalUrl, catalogName, decryptorParams);
}

async function initBookSettings(
  element: HTMLElement | null,
  webpubManifestUrl: URL,
  catalogName: string,
  decryptorParams?: any
) {
  const store = new LocalStorageStore({
    prefix: webpubManifestUrl.href
  });
  const cacher = new ServiceWorkerCacher({
    store: store,
    manifestUrl: webpubManifestUrl,
    serviceWorkerUrl: new URL("/sw.js", window.location.origin),
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
    url: new URL(document.referrer || window.location.origin),
    label: `Return to ${catalogName}`,
    ariaLabel: `Return to ${catalogName}`
  };
  const publisher = new PublisherFont();
  const serif = new SerifFont();
  const sans = new SansFont();
  const dlFont = new DyslexiaFont();
  const day = new DayTheme();
  const sepia = new SepiaTheme();
  const night = new NightTheme();
  const paginator = new ColumnsPaginatedBookView();
  const scroller = new ScrollingBookView();

  const decryptor = await Decryptor?.createDecryptor(decryptorParams);

  if (!decryptor)
    throw new ApplicationError({
      title: "Unauthorized Access",
      detail:
        "The AxisNow Decryptor package required to render this page is not installed."
    });

  const entryUrl: URL = decryptor
    ? new URL(decryptor.getEntryUrl())
    : webpubManifestUrl;
  const bookSettings = await BookSettings.create({
    store: settingsStore,
    bookFonts: [publisher, serif, sans, dlFont],
    fontSizesInPixels: fontSizes,
    bookThemes: [day, sepia, night],
    bookViews: [paginator, scroller]
  });
  await IFrameNavigator.create({
    decryptor,
    element: element,
    entryUrl: entryUrl,
    store: store,
    cacher: cacher,
    settings: bookSettings,
    annotator: annotator,
    publisher: publisher,
    serif: serif,
    sans: sans,
    dlFont: dlFont,
    day: day,
    sepia: sepia,
    night: night,
    paginator: paginator,
    scroller: scroller,
    upLink: upLink,
    allowFullscreen: true
  });
}
