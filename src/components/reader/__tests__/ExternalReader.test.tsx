import { fireEvent, render, screen, setup, waitFor } from "test-utils";
import ReaderWrapper from "../ReaderWrapper";
import ExternalReader from "../ExternalReader";

const validExternalReaderUrl = "https://webreader.com";
describe("ReaderWrapper behavior", () => {
  test("renders dialog header with Back button", () => {
    const utils = render(
      <ReaderWrapper>
        {({ loading, setLoading }) => (
          <ExternalReader
            loading={loading}
            setLoading={setLoading}
            readUrl={validExternalReaderUrl}
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

  test("go back on click", async () => {
    const back = jest.fn();

    setup(
      <ReaderWrapper>
        {({ loading, setLoading }) => (
          <ExternalReader
            loading={loading}
            setLoading={setLoading}
            readUrl={validExternalReaderUrl}
          />
        )}
      </ReaderWrapper>,
      {
        router: {
          back
        }
      }
    );

    const button = await screen.findByRole("button", { name: /Back/i });
    fireEvent.click(button);

    await waitFor(() => expect(back).toHaveBeenCalledTimes(1));
  });

  test("shows loading spinner on initial page render", () => {
    const utils = render(
      <ReaderWrapper>
        {({ loading, setLoading }) => (
          <ExternalReader
            loading={loading}
            setLoading={setLoading}
            readUrl={validExternalReaderUrl}
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
});

describe("ExternalReader loads", () => {
  test("iframe displays", async () => {
    setup(
      <ReaderWrapper>
        {({ loading, setLoading }) => (
          <ExternalReader
            loading={loading}
            setLoading={setLoading}
            readUrl={validExternalReaderUrl}
          />
        )}
      </ReaderWrapper>
    );

    const iframe = await screen.findByTitle("External Reader");

    expect(iframe).toBeInTheDocument();
  });
});
