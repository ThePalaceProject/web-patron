import * as React from "react";
import { render, screen, waitFor } from "test-utils";
import useSWR from "swr";
import ItemLandingPage from "../ItemLandingPage";
import { makeSwrResponse } from "test-utils/mockSwr";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

describe("ItemLandingPage", () => {
  beforeEach(() => {
    mockedSWR.mockReturnValue(
      makeSwrResponse<any>({
        data: {
          libraries: [
            {
              id: "urn:testlib",
              slug: "testlib",
              title: "Test Library",
              authDocUrl: "https://example.com/testlib/auth"
            }
          ]
        }
      })
    );
  });
  test("renders a heading and passes workId down to the library selector", () => {
    render(<ItemLandingPage workId="work-1" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Find a Library" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Test Library" })
    ).toBeInTheDocument();
  });

  describe("LanguageSelector", () => {
    it("displays when enabled in appConfig", () => {
      render(<ItemLandingPage workId="work-1" />, {
        appConfig: { enableLanguageSelector: true }
      });

      waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: "Choose language" })
        ).toBeInTheDocument();
      });
    });

    it("does not display when disabled in appConfig", () => {
      render(<ItemLandingPage workId="work-1" />, {
        appConfig: { enableLanguageSelector: false }
      });

      waitFor(() => {
        expect(
          screen.queryByRole("combobox", { name: "Choose language" })
        ).not.toBeInTheDocument();
      });
    });
  });
});
