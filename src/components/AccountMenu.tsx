import * as React from "react";
import { useMenuStore, MenuButton, Menu, MenuItem } from "@ariakit/react/menu";
import { Icon, IconNames } from "@nypl/design-system-react-components";
import Account from "../icons/Account";
import Copy from "../icons/Copy";
import { SignOut } from "./SignOut";
import useUser from "./context/UserContext";
import { copyToClipboard } from "../utils/clipboard";
import Button from "./Button";
import { styleProps } from "./Button/styles";

export const AccountMenu: React.FC = () => {
  const menu = useMenuStore();
  const { patronId } = useUser();

  return (
    <>
      <MenuButton
        store={menu}
        sx={{
          ...styleProps("ui.black", "md", "ghost"),
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <Account sx={{ width: 20, height: 20 }} />
        Account
      </MenuButton>

      <Menu
        store={menu}
        gutter={8}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "modal",
          border: "1px solid",
          borderColor: "ui.gray.light",
          py: 0,
          minWidth: "420px",
          zIndex: 1000,
          position: "relative",
          pt: "40px"
        }}
      >
        {/* Close button in top-right corner */}
        <Button
          variant="ghost"
          color="ui.gray.dark"
          onClick={menu.hide}
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            minWidth: "auto",
            p: 1,
            zIndex: 1
          }}
          aria-label="Close account menu"
        >
          <Icon
            decorative={false}
            name={IconNames.close}
            sx={{ fontSize: 18 }}
          />
        </Button>

        {/* Patron ID row (only if available) */}
        {patronId && <PatronIdMenuItem patronId={patronId} />}

        {/* Sign Out */}
        <SignOutMenuItem />
      </Menu>
    </>
  );
};

interface PatronIdMenuItemProps {
  patronId: string;
}

const PatronIdMenuItem: React.FC<PatronIdMenuItemProps> = ({ patronId }) => {
  const [copyStatus, setCopyStatus] = React.useState<
    "idle" | "copied" | "error"
  >("idle");

  const handleCopy = async () => {
    const success = await copyToClipboard(patronId);
    setCopyStatus(success ? "copied" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div sx={{ px: 3, py: 2 }} data-testid="patron-id-menuitem">
      <button
        onClick={handleCopy}
        type="button"
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: "transparent",
          border: "none",
          width: "100%",
          textAlign: "left",
          color: "ui.black",
          px: 2,
          py: 2,
          fontFamily: "body",
          fontSize: 1,
          fontWeight: "regular",
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "ui.gray.lightWarm"
          },
          "&:focus": {
            outline: "2px solid",
            outlineColor: "brand.primary",
            outlineOffset: "-2px"
          }
        }}
      >
        <span sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          Patron&nbsp;ID:&nbsp;{patronId}
        </span>
        <div sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {copyStatus === "copied" && (
            <span
              sx={{ fontSize: 0 }}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Copied!
            </span>
          )}
          {copyStatus === "error" && (
            <span
              sx={{ fontSize: 0, color: "ui.error" }}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Failed
            </span>
          )}
          <Copy sx={{ width: 16, height: 16 }} />
        </div>
      </button>
    </div>
  );
};

const SignOutMenuItem: React.FC = () => {
  // Reuse the existing SignOut component within the menu
  // SignOut already has the DialogDisclosure button and Modal
  return (
    <div
      sx={{
        px: 3,
        py: 2,
        "& > button": {
          width: "100%",
          justifyContent: "flex-start",
          px: 2,
          py: 2,
          fontWeight: "regular",
          borderRadius: 1
        }
      }}
    >
      <SignOut color="ui.black" />
    </div>
  );
};
