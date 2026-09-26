import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";

/**
 * Size of the logo tile and the minimum height of a card's content, in
 * pixels. 44px is the minimum comfortable touch target size.
 */
const TILE_SIZE = 44;

/**
 * Marks the card's main interactive element. Its ::after pseudo-element
 * stretches over the whole card, so a click anywhere on the card activates
 * it without adding the card itself to the tab order.
 */
const ACTION_ATTRIBUTE = "data-library-card-action";

/** Props the card's interactive element must spread onto itself. */
export type LibraryCardActionProps = {
  [ACTION_ATTRIBUTE]: "";
  "aria-describedby"?: string;
};

interface LibraryCardProps {
  logoUrl?: string;
  description?: string;
  /**
   * Renders the card's interactive element (a link or button carrying the
   * library title), which must spread `actionProps` onto itself.
   */
  children: (actionProps: LibraryCardActionProps) => React.ReactNode;
  /**
   * Rendered below the card's main row and stacked over the stretched click
   * target, so its controls stay clickable.
   */
  footer?: React.ReactNode;
}

/** Shown in the logo tile when a library has no logo or it fails to load. */
const DefaultLibraryLogo: React.FC = () => (
  <FontAwesomeIcon icon={faBuildingColumns} />
);

/*
 * The frame around the logo or default logo. It shows as a blank tile while
 * a logo loads.
 */
const tileStyle = {
  height: TILE_SIZE,
  width: TILE_SIZE,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: "2px",
  border: "1px solid",
  borderColor: "ui.gray.light",
  borderRadius: 2,
  backgroundColor: "ui.white"
} as const;

/**
 * One library in a list: a clickable card with a logo tile, the title, and
 * an optional description. The description is attached to the interactive
 * element with aria-describedby, so screen readers announce it with the
 * title. The tile shows a generic library icon when there is no logo or the
 * logo fails to load, and stays blank while the logo loads.
 */
const LibraryCard: React.FC<LibraryCardProps> = ({
  logoUrl,
  description,
  children,
  footer
}) => {
  const descriptionId = React.useId();
  const [failedLogoUrl, setFailedLogoUrl] = React.useState<string>();
  const showLogo = logoUrl && logoUrl !== failedLogoUrl;
  const action = `[${ACTION_ATTRIBUTE}]`;

  return (
    <div
      sx={{
        position: "relative",
        border: "solid",
        borderColor: "ui.gray.medium",
        borderRadius: "card",
        backgroundColor: "ui.white",
        boxShadow: "card",
        px: 3,
        py: 2,
        transition: "box-shadow 150ms ease, border-color 150ms ease",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        "&:hover": {
          boxShadow: "cardHover",
          borderColor: "ui.gray.dark"
        },
        // A separate rule so browsers without :has() still get the hover
        // above.
        "&:hover:has([aria-disabled='true'])": {
          boxShadow: "card",
          borderColor: "ui.gray.medium"
        },
        [action]: {
          color: "ui.link.primary",
          fontWeight: "medium",
          textDecoration: "none",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "card"
          },
          "&:focus-visible": { outline: "none" },
          "&:focus-visible::after": {
            outline: "3px solid",
            outlineColor: "ui.blue.focus",
            outlineOffset: "2px"
          }
        }
      }}
    >
      <div
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          minHeight: TILE_SIZE
        }}
      >
        <div sx={tileStyle}>
          {showLogo ? (
            <img
              src={logoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setFailedLogoUrl(logoUrl)}
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "contain"
              }}
            />
          ) : (
            <span
              aria-hidden="true"
              data-testid="default-library-logo"
              sx={{ display: "flex", color: "ui.gray.dark" }}
            >
              <DefaultLibraryLogo />
            </span>
          )}
        </div>
        <div
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0
          }}
        >
          <div>
            {children({
              [ACTION_ATTRIBUTE]: "",
              ...(description ? { "aria-describedby": descriptionId } : {})
            })}
          </div>
          {description && (
            <div
              id={descriptionId}
              sx={{
                fontSize: "-1",
                color: "ui.gray.extraDark",
                // Clamp long registry descriptions to two lines.
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      {footer && <div sx={{ position: "relative", zIndex: 1 }}>{footer}</div>}
    </div>
  );
};

export default LibraryCard;
