import { OPDS1 } from "interfaces";

export const typeMap: Record<
  OPDS1.DownloadMediaType,
  { extension: string; name: string }
> = {
  "application/vnd.overdrive.circulation.api+json;profile=audiobook": {
    extension: "",
    name: "Overdrive Audiobook"
  },
  "application/epub+zip": {
    extension: ".epub",
    name: "EPUB"
  },
  "application/kepub+zip": {
    // got this from here: https://wiki.mobileread.com/wiki/Kepub
    extension: ".kepub.epub",
    name: "KEPUB"
  },
  "application/pdf": {
    extension: ".pdf",
    name: "PDF"
  },
  "application/x-mobipocket-ebook": {
    extension: ".mobi",
    name: "MOBI"
  },
  "application/x-mobi8-ebook": {
    extension: ".azw3",
    name: "Mobi8"
  },
  "application/audiobook+json": {
    extension: ".audiobook",
    name: "Audiobook"
  }
};

export const generateFilename = (str: string, extension: string) => {
  return (
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + extension
  );
};
