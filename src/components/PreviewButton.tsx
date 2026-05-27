import * as React from "react";
import Button from "components/Button";
import SvgExternalLink from "icons/ExternalOpen";

const PreviewButton: React.FC<{ previewUrl: string }> = ({ previewUrl }) => {
  function open() {
    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
      newTab.document.title = "Loading…";
      const p = newTab.document.createElement("p");
      p.textContent = "Loading…";
      p.style.cssText =
        "font-family:sans-serif;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)";
      newTab.document.body.appendChild(p);
      newTab.location.href = previewUrl;
    } else {
      window.location.href = previewUrl;
    }
  }

  return (
    <Button
      variant="ghost"
      color="ui.gray.extraDark"
      iconLeft={SvgExternalLink}
      onClick={open}
    >
      Preview
    </Button>
  );
};

export default PreviewButton;
