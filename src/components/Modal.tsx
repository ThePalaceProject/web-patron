/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { Dialog } from "@ariakit/react/dialog";
import { Icon, IconNames } from "@nypl/design-system-react-components";
import Button from "components/Button";

export const modalButtonStyles = {
  m: 2,
  display: "flex",
  flex: "1 0 auto",
  width: "280px",
  height: "51px",
  backgroundSize: `280px 51px`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "0",
  cursor: "pointer",
  border: "none",
  marginLeft: "auto",
  marginRight: "auto"
};

type ModalProps = {
  dialog: any;
  hide?: () => void;
  label?: string;
  className?: string;
  hideOnClickOutside?: boolean;
  role?: string;
  showClose?: boolean;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  dialog,
  hide,
  children,
  label,
  className,
  hideOnClickOutside,
  role,
  showClose = true
}) => {
  return (
    <Dialog
      store={dialog}
      role={role}
      className={className}
      hideOnInteractOutside={hideOnClickOutside}
      backdrop={
        <div
          sx={{
            backgroundColor: "rgb(0 0 0 / 0.1)",
            "-webkit-backdrop-filter": "blur(4px)",
            backdropFilter: "blur(4px)"
          }}
        ></div>
      }
      sx={{
        background: "white",
        borderRadius: 2,
        boxShadow: "modal",
        px: 4,
        py: 3,
        m: 2,
        position: "fixed",
        height: "fit-content",
        maxWidth: "400px",
        inset: "0.75rem",
        margin: "auto"
      }}
      aria-label={label}
    >
      {showClose && (
        <Button
          variant="ghost"
          color="ui.gray.dark"
          onClick={hide}
          sx={{ position: "absolute", top: 2, right: 2 }}
        >
          <Icon
            decorative={false}
            name={IconNames.close}
            sx={{ fontSize: 18 }}
          />
        </Button>
      )}
      {children}
    </Dialog>
  );
};

export default Modal;
