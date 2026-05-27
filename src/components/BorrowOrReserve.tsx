import * as React from "react";
import useBorrow from "hooks/useBorrow";
import Button from "./Button";
import { Text } from "./Text";
import Stack from "components/Stack";
import PreviewButton from "./PreviewButton";

const BorrowOrReserve: React.FC<{
  isBorrow: boolean;
  url: string;
  className?: string;
  previewUrl?: string | null;
}> = ({ isBorrow, url, className, previewUrl }) => {
  const { isLoading, loadingText, buttonLabel, borrowOrReserve, error } =
    useBorrow(isBorrow);
  return (
    <Stack
      direction="column"
      sx={{ alignItems: "flex-start" }}
      className={className}
    >
      <Stack>
        <Button
          onClick={() => borrowOrReserve(url)}
          loading={isLoading}
          loadingText={loadingText}
        >
          {buttonLabel}
        </Button>
        {previewUrl && <PreviewButton previewUrl={previewUrl} />}
      </Stack>
      {error && <Text sx={{ color: "ui.error" }}>{error}</Text>}
    </Stack>
  );
};

export default BorrowOrReserve;
