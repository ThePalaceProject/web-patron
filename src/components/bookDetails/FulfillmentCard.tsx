/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { getFulfillmentState } from "../../utils/book";
import {
  BookData,
  MediaType,
  MediaLink,
  FulfillmentLink
} from "opds-web-client/lib/interfaces";
import { typeMap } from "opds-web-client/lib/utils/file";
import { RequiredKeys } from "../../interfaces";
import { bookIsOpenAccess } from "opds-web-client/lib/utils/book";
import Button, { AnchorButton } from "../Button";
import useDownloadButton from "opds-web-client/lib/hooks/useDownloadButton";
import { withErrorBoundary } from "../ErrorBoundary";
import Select, { Label } from "../Select";
import useBorrow from "../../hooks/useBorrow";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { MediumIcon } from "components/MediumIndicator";
import SvgDownload from "icons/Download";
import SvgPhone from "icons/Phone";

const FulfillmentCard: React.FC<{ book: BookData }> = ({ book }) => {
  return (
    <Stack
      direction="column"
      aria-label="Borrow and download card"
      sx={{
        bg: "ui.gray.lightWarm",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "ui.gray.extraDark",
        my: 3
      }}
    >
      <FulfillmentContent book={book} />
    </Stack>
  );
};

const FulfillmentContent: React.FC<{ book: BookData }> = ({ book }) => {
  const fulfillmentState = getFulfillmentState(book);

  switch (fulfillmentState) {
    case "openAccess":
      return <OpenAccess book={book} />;
    case "availableToBorrow":
      return <BorrowOrReserve book={book} />;
    case "availableToReserve":
      return <BorrowOrReserve book={book} />;
    case "reserved":
      return <Reserved book={book} />;
    case "borrowed/protected":
      return <DownloadCard book={book} />;
    case "error":
      return <ErrorCard book={book} />;
  }
};

const OpenAccess: React.FC<{ book: BookData }> = ({ book }) => {
  return (
    <>
      <Stack sx={{ alignItems: "center" }}>
        <SvgPhone sx={{ fontSize: 64 }} />
        <Stack direction="column">
          <Text variant="text.callouts.bold">
            You&apos;re ready to read this book in SimplyE!
          </Text>
          <Text>This open access book is available to keep forever.</Text>
        </Stack>
      </Stack>
      <Stack direction="column" sx={{ mt: 3 }}>
        <Text variant="text.body.italic">
          If you would rather read on your computer, you can:
        </Text>
        <Stack sx={{ justifyContent: "center" }}>
          {book.openAccessLinks?.map(link => (
            <AnchorButton
              key={link.url}
              variant="link"
              color="ui.black"
              newTab
              href={link.url}
            >
              <SvgDownload sx={{ mr: 1 }} /> Download {typeMap[link.type].name}
            </AnchorButton>
          ))}
        </Stack>
      </Stack>
    </>
  );
};

const BorrowOrReserve: React.FC<{ book: BookData }> = ({ book }) => {
  const {
    title,
    subtitle,
    buttonLabel,
    buttonLoadingText,
    isLoading,
    borrowOrReserve,
    errorMsg
  } = useBorrow(book);

  return (
    <>
      <Text variant="text.callouts.bold">{title}</Text>
      <Text
        variant="text.body.italic"
        sx={{ display: "inline-flex", alignItems: "center" }}
      >
        <MediumIcon book={book} sx={{ mr: 1 }} /> {subtitle}
      </Text>
      <Button
        size="lg"
        onClick={borrowOrReserve}
        loading={isLoading}
        loadingText={buttonLoadingText}
      >
        <Text variant="text.body.bold">{buttonLabel}</Text>
      </Button>
      {errorMsg && <Text sx={{ color: "ui.error" }}>{errorMsg}</Text>}
    </>
  );
};

const Reserved: React.FC<{ book: BookData }> = ({ book }) => {
  return (
    <>
      <Text variant="text.callouts.bold">You have this book on hold.</Text>
      <Text
        variant="text.body.italic"
        sx={{ display: "inline-flex", alignItems: "center" }}
      >
        <MediumIcon book={book} sx={{ mr: 1 }} />
        You&apos;re 14th in the queue.
      </Text>
      <Button size="lg" disabled>
        <Text variant="text.body.bold">Reserved</Text>
      </Button>
      {/* {errorMsg && <Text sx={{ color: "ui.error" }}>{errorMsg}</Text>} */}
    </>
  );
};

const ErrorCard: React.FC = () => {
  return (
    <>
      <Text variant="text.callouts.bold">
        There was an error processing this book.
      </Text>
      <Text
        variant="text.body.italic"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        We are unable to show you the book&apos;s availability. Try refreshing
        your page. If the problem persists, please contact library support.
      </Text>
    </>
  );
};

/**
 * Handles the case where it is ready for download either via openAccessLink or
 * via fulfillmentLink.
 */
const DownloadCard: React.FC<{
  book: BookData;
  className?: string;
}> = ({ book }) => {
  const isOpenAccess = bookIsOpenAccess(book);
  const { fulfillmentLinks, openAccessLinks, title } = book;
  const links = (isOpenAccess ? openAccessLinks : fulfillmentLinks) ?? [];

  // for some reason there are duplicate links. Dedupe them w a map by mimeType
  type MimetypeToLinkMap = {
    [key in MediaType]?: MediaLink | FulfillmentLink;
  };
  const linksByMimetype: MimetypeToLinkMap = {};
  links.forEach(link => (linksByMimetype[link.type] = link));

  const defaultType = links[0]?.type;
  const [selectedType, setSelectedType] = React.useState<MediaType>(
    defaultType
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.currentTarget.value as MediaType);
  };

  const currentLink = linksByMimetype[selectedType];
  const downloadDetails = useDownloadButton(currentLink, title);

  if (!downloadDetails) return null;
  return (
    <>
      <div
        sx={{
          borderBottom: "1px solid",
          borderColor: "primary"
        }}
      >
        <div
          sx={{ fontWeight: "semibold", display: "flex", alignItems: "center" }}
        >
          <Label htmlFor="format-select">TYPE</Label>
          <Select
            id="format-select"
            value={selectedType}
            onBlur={handleTypeChange}
            onChange={handleTypeChange}
            sx={{ ml: 2 }}
          >
            {Object.keys(linksByMimetype).map(mediaType => (
              <option key={mediaType} value={mediaType}>
                {typeMap[mediaType]?.name ?? mediaType}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div sx={{ mb: 2, textAlign: "center" }}>availability</div>
        {isOpenAccess ? (
          <a
            target="__blank"
            rel="noopener noreferrer"
            href={linksByMimetype[selectedType]?.url}
            sx={{ variant: "buttons.accent", px: 2, py: 1 }}
          >
            Download
          </a>
        ) : (
          <Button onClick={downloadDetails.fulfill}>Download</Button>
        )}
      </div>
    </>
  );
};

// const WithBoundary = withErrorBoundary(FulfillmentCard, ErrorFallback);
export default FulfillmentCard;
