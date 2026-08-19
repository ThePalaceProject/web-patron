import * as React from "react";
import Button from "components/Button";
import Stack from "components/Stack";
import { Text } from "components/Text";
import { useTranslation } from "next-i18next/pages";

export const AuthFeedbackPanel = ({
  message,
  isError = false,
  onTryAgain,
  secondaryAction
}: {
  message: string;
  isError?: boolean;
  onTryAgain: () => void;
  secondaryAction?: { label: string; onClick: () => void };
}) => {
  const { t } = useTranslation();
  return (
    <Stack
      direction="column"
      sx={{
        alignItems: "center",
        gap: 3,
        maxWidth: 500,
        margin: "0 auto",
        textAlign: "center",
        textWrap: "balance"
      }}
    >
      <Text sx={isError ? { color: "ui.error", fontSize: 2 } : { fontSize: 2 }}>
        {message}
      </Text>
      <Button onClick={onTryAgain}>
        {t("authFeedbackPanel.tryAgain", "Try Again")}
      </Button>
      {secondaryAction && (
        <Button variant="ghost" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      )}
    </Stack>
  );
};
