import { fetchBearerToken, fetchBook } from "dataflow/opds1/fetch";
import ApplicationError from "errors";
import {
  FulfillableBook,
  FulfillmentLink,
  MediaSupportLevel,
  OPDS1
} from "interfaces";
import { DownloadMediaType } from "types/opds1";
import { bookIsAudiobook } from "utils/book";
import { APP_CONFIG } from "utils/env";
import { typeMap } from "utils/file";

/**
 * Fulfilling a book requires a couple pieces of information:
 *  - The configured support type for that combination of indirectionType and contentType
 *  - What UX should be presented to the user
 *  - How to actually go about fulfilling that UX
 *
 * Both of these are determined by a combination of the final content type
 * and any layers of indirection the media is wrapped in. This file is an
 * attempt to centralize the logic of dealing with different media types
 * and layers of indirection.
 *
 * This file is based on:
 * https://docs.google.com/document/d/1dli5mgTbVaURN_B2AtUmPhgpaFUVqOqrzsaoFvCXnkA/edit?pli=1#
 */

export type AuthorizedLocation = {
  url: string;
  token?: string;
};

export type DownloadFulfillment = {
  type: "download";
  id: string;
  contentType: DownloadMediaType;
  getLocation: GetLocationWithIndirection;
  buttonLabel: string;
};
export type ReadInternalFulfillment = {
  type: "read-online-internal";
  id: string;
  url: string;
  buttonLabel: string;
};
export type ReadExternalFulfillment = {
  type: "read-online-external";
  id: string;
  getLocation: GetLocationWithIndirection;
  buttonLabel: string;
};
export type UnsupportedFulfillment = {
  type: "unsupported";
};

export type SupportedFulfillment =
  | DownloadFulfillment
  | ReadExternalFulfillment
  | ReadInternalFulfillment;

export type AnyFullfillment = SupportedFulfillment | UnsupportedFulfillment;

export function getFulfillmentFromLink(link: FulfillmentLink): AnyFullfillment {
  const { contentType, indirectionType, supportLevel } = link;

  // don't show fulfillment option if it is unsupported or only allows
  // a redirect to the companion app.
  if (supportLevel === "unsupported" || supportLevel === "redirect") {
    return { type: "unsupported" };
  }

  // TODO: I'm not sure that we need these special "unsupported" cases here,
  //  since we can set this in the configuration. For example, there might
  //  be cases in the future in which there is no support in this app, but
  //  support is present in the mobile apps. It might be better to restrict
  //  the possible types, depending on whether we directly support it in-app.
  // there is no support for books with "Libby" DRM
  // There is no support for books with AxisNow DRM.
  if (
    [OPDS1.OverdriveEbookMediaType, OPDS1.AxisNowWebpubMediaType].includes(
      contentType
    )
  ) {
    return { type: "unsupported" };
  }
  switch (contentType) {
    case OPDS1.PdfMediaType:
    case OPDS1.Mobi8Mediatype:
    case OPDS1.MobiPocketMediaType:
    case OPDS1.EpubMediaType:
      const typeName = typeMap[contentType].name;
      const modifier =
        indirectionType === OPDS1.AdobeDrmMediaType ? "Adobe " : "";
      return {
        id: link.url,
        getLocation: constructGetLocation(
          indirectionType,
          contentType,
          link.url
        ),
        type: "download",
        buttonLabel: `Download ${modifier}${typeName}`,
        contentType
      };

    case OPDS1.ExternalReaderMediaType:
    case OPDS1.ExternalReaderMediaTypeUnquoted:
      return {
        id: link.url,
        type: "read-online-external",
        getLocation: constructGetLocation(
          indirectionType,
          contentType,
          link.url
        ),
        buttonLabel: "Read Online"
      };

    case OPDS1.HTMLMediaType:
      return {
        id: link.url,
        type: "read-online-internal",
        url: link.url,
        buttonLabel: "Read Online"
      };
  }
  // TODO: track to bugsnag that we have found an unhandled media type
  return {
    type: "unsupported"
  };
}

export function getFulfillmentsFromBook(
  book: FulfillableBook
): SupportedFulfillment[] {
  const links = book.fulfillmentLinks;
  const dedupedLinks = dedupeLinks(links);
  const supported = dedupedLinks
    .map(getFulfillmentFromLink)
    .filter(isSupported);
  if (bookIsAudiobook(book)) {
    // only allow read-online-internal, i.e. OPDS1.HTMLMediaType, for now
    return supported.filter(
      fulfillment => fulfillment.type === "read-online-internal"
    );
  }
  return supported;
}

function isSupported(
  fulfillment: AnyFullfillment
): fulfillment is SupportedFulfillment {
  return fulfillment.type !== "unsupported";
}

/**
 * Constructs a function to be used later to fetch the actual url and token to use to retrieve the
 * book, when a user clicks on the fulfillment button
 */
type GetLocationWithIndirection = (
  catalogUrl: string,
  token?: string
) => Promise<AuthorizedLocation>;
const constructGetLocation =
  (
    indirectionType: OPDS1.IndirectAcquisitionType | undefined,
    contentType: OPDS1.AnyBookMediaType,
    url: string
  ): GetLocationWithIndirection =>
  async (catalogUrl: string, token?: string) => {
    /**
     * If there is OPDS Entry Indirection, we fetch the actual link
     * from within an entry
     */
    if (indirectionType === OPDS1.OPDSEntryMediaType) {
      const book = (await fetchBook(url, catalogUrl, token)) as FulfillableBook;
      const resolvedUrl = book.fulfillmentLinks?.find(
        link => link.contentType === contentType
      )?.url;
      if (!resolvedUrl) {
        throw new ApplicationError({
          title: "OPDS Error",
          detail:
            "Indirect OPDS Entry did not contain the correct acquisition link."
        });
      }
      return {
        url: resolvedUrl,
        token
      };
    }

    if (indirectionType === OPDS1.BearerTokenMediaType) {
      const bearerToken = await fetchBearerToken(url, token);

      return {
        url: bearerToken.location,
        token: `${bearerToken.token_type} ${bearerToken.access_token}`
      };
    }

    // otherwise there is no indirection, just return the url and token.
    return {
      url,
      token
    };
  };

export function dedupeLinks(links: readonly FulfillmentLink[]) {
  return links.reduce<FulfillmentLink[]>((uniqueArr, current) => {
    const isDup = uniqueArr.find(
      uniqueLink => uniqueLink.contentType === current.contentType
    );

    return isDup ? uniqueArr : [...uniqueArr, current];
  }, []);
}

export function getAppSupportLevel(
  contentType: OPDS1.AnyBookMediaType,
  indirectionType: OPDS1.IndirectAcquisitionType | undefined
): MediaSupportLevel {
  const { mediaSupport } = APP_CONFIG;
  const defaultSupportLevel: MediaSupportLevel =
    mediaSupport?.default ?? "unsupported";

  // if there is indirection, we search through the dictionary nested inside the
  // indirectionType
  if (indirectionType) {
    const supportLevel = mediaSupport[indirectionType]?.[contentType];
    return supportLevel ?? defaultSupportLevel;
  }

  return mediaSupport[contentType] ?? defaultSupportLevel;
}

/**
 * Check if any of the links is redirect or redirect-and-show support level
 */
export function shouldRedirectToCompanionApp(
  links: readonly FulfillmentLink[]
) {
  return links.reduce((prev, link) => {
    if (prev) return true;
    const supportLevel = link.supportLevel;
    if (supportLevel === "redirect" || supportLevel === "redirect-and-show") {
      return true;
    }
    return false;
  }, false);
}
