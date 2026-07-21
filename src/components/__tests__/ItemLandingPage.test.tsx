import * as React from "react";
import { render, screen } from "test-utils";
import useSWR from "swr";
import ItemLandingPage from "../ItemLandingPage";
import { makeSwrResponse } from "test-utils/mockSwr";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

test("renders a heading and passes workId down to the library selector", () => {
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

  render(<ItemLandingPage workId="work-1" />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Find a Library" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Test Library" })
  ).toBeInTheDocument();
});
