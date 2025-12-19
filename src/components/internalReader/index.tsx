import React, { useState } from "react";
import extractParam from "dataflow/utils";
import { useRouter } from "next/router";
import { Dialog, DialogDismiss } from "@ariakit/react";
import Button from "components/Button";
import LoadingIndicator from "components/LoadingIndicator";
import { Container } from "theme-ui";
import ChevronLeft from "icons/ChevronLeft";

const InternalReader: React.FC = () => {
  const { back, query } = useRouter();
  const readUrl = extractParam(query, "readUrl") as string;
  const close = () => back();

  const [loading, setLoading] = useState(true);

  return (
    <Dialog
      open
      onClose={close}
      portal={false}
      sx={{
        position: "fixed",
        top: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "white"
      }}
    >
      <DialogDismiss
        render={
          <Button
            variant="ghost"
            color="text"
            iconLeft={ChevronLeft}
            sx={{ alignSelf: "flex-start", margin: 10 }}
          >
            Back
          </Button>
        }
      />
      {loading && (
        <Container
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end"
          }}
        >
          <LoadingIndicator />
        </Container>
      )}
      <iframe
        sx={{ flex: 1, visibility: loading ? "hidden" : "visible" }}
        title="Online Reader"
        src={decodeURIComponent(readUrl)}
        onError={console.log}
        onLoad={() => setLoading(false)}
      />
    </Dialog>
  );
};

export default InternalReader;
