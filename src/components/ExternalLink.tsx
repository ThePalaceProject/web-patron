import * as React from "react";
import { VisuallyHidden } from "@ariakit/react";
import { AnchorButton } from "./Button";
import { useTranslation } from "next-i18next/pages";

const ExternalLink: React.FC<React.ComponentPropsWithoutRef<"a">> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <AnchorButton
      variant="link"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
      <VisuallyHidden>
        {t("externalLink.opens", "(Opens in a new tab)")}
      </VisuallyHidden>
    </AnchorButton>
  );
};

export default ExternalLink;
