import { fetchBook } from "dataflow/opds1/fetch";
import ApplicationError from "errors";
import { MediaLink, OPDS1 } from "interfaces";
import { typeMap } from "owc/utils/file";
import { NEXT_PUBLIC_AXIS_NOW_DECRYPT } from "utils/env";

/**
 * Fulfilling a book requires a couple pieces of information:
 *  - What UX should be presented to the user
 *  - How to actually go about fulfilling that UX
 *
 * Both of these are determinded by a combination of the final content type
 * and any layers of indirection the media is wrapped in. This file is an
 * attempt to centralize the logic of dealing with different media types
 * and layers of indirection.
 *
 * This file is based on:
 * https://docs.google.com/document/d/1dli5mgTbVaURN_B2AtUmPhgpaFUVqOqrzsaoFvCXnkA/edit?pli=1#
 */

export type DownloadDetails = {
  id: string;
  type: "download";
  mediaType: OPDS1.AnyBookMediaType;
  url: string;
  buttonLabel: string;
};
export type ReadInternalDetails = {
  id: string;
  type: "read-online-internal";
  url: string;
  buttonLabel: string;
};
export type ReadExternalDetails = {
  id: string;
  type: "read-online-external";
  getUrl: (catalogUrl: string, token?: string) => Promise<string>;
  buttonLabel: string;
};
export type UnsupportedDetails = {
  type: "unsupported";
};

export type FulfillmentDetails =
  | DownloadDetails
  | ReadExternalDetails
  | ReadInternalDetails
  | UnsupportedDetails;

export function getFulfillmentDetails(link: MediaLink): FulfillmentDetails {
  const contentType = fixMimeType(link.indirectType ?? link.type);
  // if there is a layer of indirection, we have an initial type
  const initialType =
    "indirectType" in link && link.indirectType
      ? fixMimeType(link.type)
      : undefined;

  // there is no support for books with "Libby" DRM
  if (
    contentType === OPDS1.OverdriveEbookMediaType ||
    initialType === OPDS1.OverdriveEbookMediaType
  ) {
    return { type: "unsupported" };
  }
  switch (contentType) {
    case OPDS1.PdfMediaType:
    case OPDS1.Mobi8Mediatype:
    case OPDS1.MobiPocketMediaType:
    case OPDS1.EpubMediaType:
      const typeName = typeMap[contentType].name;
      const modifier = initialType === OPDS1.AdeptMediaType ? "Adobe " : "";
      return {
        id: link.url,
        url: link.url,
        type: "download",
        buttonLabel: `Download ${modifier}${typeName}`,
        mediaType: contentType
      };

    case OPDS1.ExternalReaderMediaType:
      return {
        id: link.url,
        getUrl: getReaderUrl(initialType, contentType, link.url),
        type: "read-online-external",
        buttonLabel: "Read on Overdrive"
      };

    case OPDS1.AxisNowWebpubMediaType:
      // you can only read these if you can decrypt them.
      if (!NEXT_PUBLIC_AXIS_NOW_DECRYPT) {
        return { type: "unsupported" };
      }
      return {
        id: link.url,
        // parse the url into the internal url we need to send the user to
        url: `/read/${encodeURIComponent(link.url)}`,
        type: "read-online-internal",
        buttonLabel: "Read Online"
      };
  }
  return {
    type: "unsupported"
  };
}

const getReaderUrl = (
  initialType:
    | OPDS1.AnyBookMediaType
    | OPDS1.IndirectAcquisitionType
    | undefined,
  contentType: OPDS1.AnyBookMediaType,
  url: string
) => async (catalogUrl: string, token: string) => {
  if (initialType === OPDS1.OPDSEntryMediaType) {
    /**
     * If there is OPDS Entry Indirection, we fetch the actual link
     * from within an entry
     */
    const book = await fetchBook(url, catalogUrl, token);
    const resolvedUrl = book.fulfillmentLinks?.find(
      link => link.type === contentType
    )?.url;
    if (!resolvedUrl) {
      throw new ApplicationError(
        "Indirect OPDS Entry did not contain the correct acquisition link."
      );
    }
    return resolvedUrl;
  }
  return url;
};

/**
 * There is or was an error in the CM where it sent us incorrectly formatted
 * Adobe media types.
 */
export function fixMimeType(
  mimeType: OPDS1.IndirectAcquisitionType | OPDS1.AnyBookMediaType
) {
  return mimeType === "vnd.adobe/adept+xml"
    ? "application/vnd.adobe.adept+xml"
    : mimeType;
}

export function dedupeLinks(links: MediaLink[]) {
  return links.reduce<MediaLink[]>((uniqueArr, current) => {
    const isDup = uniqueArr.find(
      uniqueLink => uniqueLink.type === current.type
    );

    return isDup ? uniqueArr : [...uniqueArr, current];
  }, []);
}
