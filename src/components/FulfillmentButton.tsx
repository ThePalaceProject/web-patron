import * as React from "react";
import {
  AnyFullfillment,
  DownloadFulfillment,
  ReadExternalFulfillment,
  ReadInternalFulfillment
} from "utils/fulfill";
import { FulfillableBook } from "interfaces";
import track from "analytics/track";
import SvgDownload from "icons/Download";
import SvgExternalLink from "icons/ExternalOpen";
import { useRouter } from "next/router";
import { Text } from "components/Text";
import Button from "components/Button";
import useLibraryContext from "components/context/LibraryContext";
import useUser from "components/context/UserContext";
import downloadFile from "dataflow/download";
import useError from "hooks/useError";
import useLinkUtils from "hooks/useLinkUtils";
import Stack from "./Stack";

const FulfillmentButton: React.FC<{
  details: AnyFullfillment;
  book: FulfillableBook;
  isPrimaryAction: boolean;
}> = ({ details, book, isPrimaryAction }) => {
  switch (details.type) {
    case "download":
      return (
        <DownloadButton
          details={details}
          title={book.title}
          isPrimaryAction={isPrimaryAction}
        />
      );
    case "read-online-internal":
      return (
        <ReadOnlineInternal
          details={details}
          isPrimaryAction={isPrimaryAction}
          trackOpenBookUrl={book.trackOpenBookUrl}
        />
      );
    case "read-online-external":
      return (
        <ReadOnlineExternal
          details={details}
          isPrimaryAction={isPrimaryAction}
          trackOpenBookUrl={book.trackOpenBookUrl}
        />
      );
    case "unsupported":
      return null;
  }
};

export default FulfillmentButton;

function getButtonStyles(isPrimaryAction: boolean) {
  return isPrimaryAction
    ? ({
        variant: "filled",
        color: "brand.primary"
      } as const)
    : ({
        variant: "ghost",
        color: "ui.gray.extraDark"
      } as const);
}

const ReadOnlineExternal: React.FC<{
  details: ReadExternalFulfillment;
  isPrimaryAction: boolean;
  trackOpenBookUrl: string | null;
}> = ({ details, isPrimaryAction, trackOpenBookUrl }) => {
  const { catalogUrl } = useLibraryContext();
  const { token } = useUser();
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, clearError } = useError();

  const router = useRouter();
  const { buildReaderLink } = useLinkUtils();

  async function open() {
    setLoading(true);
    clearError();
    try {
      // the url may be behind indirection, so we fetch it with the
      // provided function
      const { url: externalReaderUrl } = await details.getLocation(
        catalogUrl,
        token
      );

      // Instead of throwing user out to a different tab,
      // we place them into an embedded iframe within the app
      const externalLink = buildReaderLink("external", externalReaderUrl);

      // we are about to open the book, so send a track event
      track.openBook(trackOpenBookUrl);
      router.push(externalLink, undefined, { shallow: true });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
  }

  return (
    <Stack sx={{ flexWrap: "wrap" }}>
      <Button
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgExternalLink}
        onClick={open}
        loading={loading}
        loadingText="Opening..."
      >
        {details?.buttonLabel ?? "Read"}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </Stack>
  );
};

const ReadOnlineInternal: React.FC<{
  details: ReadInternalFulfillment;
  trackOpenBookUrl: string | null;
  isPrimaryAction: boolean;
}> = ({ details, isPrimaryAction, trackOpenBookUrl }) => {
  const router = useRouter();
  const { buildReaderLink } = useLinkUtils();

  const internalLink = buildReaderLink("internal", details.url);
  function open() {
    track.openBook(trackOpenBookUrl);
    router.push(internalLink, undefined, { shallow: true });
  }
  return (
    <Button {...getButtonStyles(isPrimaryAction)} onClick={open}>
      {details?.buttonLabel ?? "Read"}
    </Button>
  );
};

const DownloadButton: React.FC<{
  details: DownloadFulfillment;
  title: string;
  isPrimaryAction: boolean;
}> = ({ details, title, isPrimaryAction }) => {
  const { buttonLabel } = details;
  const [loading, setLoading] = React.useState(false);
  const { error, handleError, clearError } = useError();
  const { catalogUrl } = useLibraryContext();
  const { token } = useUser();

  async function download() {
    setLoading(true);
    clearError();
    try {
      const { url: downloadUrl, token: downloadToken } =
        await details.getLocation(catalogUrl, token);

      await downloadFile(
        downloadUrl,
        title,
        details.contentType,
        downloadToken
      );
    } catch (e) {
      setLoading(false);
      handleError(e);
    }
    setLoading(false);
  }

  return (
    <>
      <Button
        onClick={download}
        {...getButtonStyles(isPrimaryAction)}
        iconLeft={SvgDownload}
        loading={loading}
        loadingText="Downloading..."
      >
        {buttonLabel}
      </Button>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </>
  );
};
