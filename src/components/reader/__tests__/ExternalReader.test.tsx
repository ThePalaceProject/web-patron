import { render, screen, setup } from "test-utils";
import ReaderWrapper from "../ReaderWrapper";
import ExternalReader from "../ExternalReader";

test("renders dialog header with Back button", () => {
  const utils = render(
    <ReaderWrapper>
      {({ loading, setLoading, readUrl }) => (
        <ExternalReader
          loading={loading}
          setLoading={setLoading}
          readUrl={readUrl}
        />
      )}
    </ReaderWrapper>
  );
  expect(
    utils.getByRole("button", {
      name: "Back"
    })
  ).toBeInTheDocument();
});

test("shows loading spinner on initial page render", () => {
  const utils = render(
    <ReaderWrapper>
      {({ loading, setLoading, readUrl }) => (
        <ExternalReader
          loading={loading}
          setLoading={setLoading}
          readUrl={readUrl}
        />
      )}
    </ReaderWrapper>
  );
  expect(
    utils.getByRole("img", {
      name: "Loading"
    })
  ).toBeInTheDocument();
});

test("iframe displays", async () => {
  setup(
    <ReaderWrapper>
      {({ loading, setLoading, readUrl }) => (
        <ExternalReader
          loading={loading}
          setLoading={setLoading}
          readUrl={readUrl}
        />
      )}
    </ReaderWrapper>
  );

  const iframe = await screen.findByTitle("External Reader");

  expect(iframe).toBeInTheDocument();
});
