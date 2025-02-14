import * as React from "react";
import { fixtures, render, setup, screen, waitFor } from "test-utils";
import merge from "deepmerge";
import { BookDetails } from "../index";
import { AnyBook } from "interfaces";
import * as complaintActions from "hooks/useComplaints/actions";
import ReportProblem from "../ReportProblem";
import { ServerError } from "errors";
import useSWR from "swr";
import mockConfig from "test-utils/mockConfig";
import { BreadcrumbContext } from "components/context/BreadcrumbContext";

jest.mock("swr");

const mockedSWR = useSWR as jest.MockedFunction<typeof useSWR>;

function makeSwrResponse(value: Partial<ReturnType<typeof useSWR>>) {
  return {
    data: undefined,
    error: undefined,
    revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}
function mockSwr(value: Partial<ReturnType<typeof useSWR>>) {
  mockedSWR.mockReturnValue(makeSwrResponse(value));
}

describe("book details page", () => {
  test("shows loading state", () => {
    mockSwr({ data: undefined });

    setup(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    expect(
      screen.getByRole("heading", { name: "Loading..." })
    ).toBeInTheDocument();
  });

  test("rethrows SWR errors to be caught by error boundary", async () => {
    try {
      mockSwr({
        error: new ServerError("url", 418, {
          detail: "Something",
          title: "you messed up",
          status: 418
        })
      });
    } catch (err) {
      expect(() =>
        setup(<BookDetails />, {
          router: { query: { bookUrl: "/book-url" } }
        })
      ).toThrowError(ServerError);
    }
  });

  test("shows categories", () => {
    mockSwr({
      data: fixtures.book
    });
    setup(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    const categories = fixtures.book.categories?.join(", ") as string;
    expect(screen.getByText(categories));
    expect(screen.getByText("Categories:"));
  });

  test("doesn't show categories when there aren't any", () => {
    const bookWithoutCategories: AnyBook = merge(fixtures.book, {
      categories: null
    });
    mockSwr({ data: bookWithoutCategories });
    setup(<BookDetails />);
    expect(screen.queryByText("Categories:")).toBeFalsy();
  });

  test("shows publisher", () => {
    mockSwr({ data: fixtures.book });
    setup(<BookDetails />);
    const publisher = fixtures.book.publisher as string;

    expect(screen.getByText(publisher)).toBeInTheDocument();
    expect(screen.getByText("Publisher:")).toBeInTheDocument();
  });

  test("shows provider name", () => {
    mockSwr({ data: fixtures.book });
    setup(<BookDetails />);
    const providerName = fixtures.book.providerName as string;

    expect(screen.getByText(providerName)).toBeInTheDocument();
    expect(screen.getByText("Distributed by:")).toBeInTheDocument();
  });

  test("does not show simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'openebooks'", () => {
    mockConfig({ companionApp: "openebooks" });
    mockSwr({ data: fixtures.book });
    setup(<BookDetails />);

    expect(screen.queryByText("Download Palace")).not.toBeInTheDocument();

    expect(screen.queryByText("Palace Logo")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Browse and read our collection of ebooks and audiobooks right from your phone."
      )
    ).not.toBeInTheDocument();
  });

  test("shows simplyE callout when NEXT_PUBLIC_COMPANION_APP is 'simplye'", async () => {
    mockConfig({ companionApp: "simplye" });
    mockSwr({ data: fixtures.book });
    setup(<BookDetails />);

    expect(screen.getByText("Download Palace")).toBeInTheDocument();
    expect(screen.getByLabelText("Palace Logo")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Browse and read our collection of ebooks and audiobooks right from your phone."
      )
    ).toBeInTheDocument();

    const iosBadge = screen.getByRole("link", {
      name: "Download Palace on the Apple App Store",
      hidden: true // it is initially hidden by a media query, only displayed on desktop
    });
    expect(iosBadge).toBeInTheDocument();
    expect(iosBadge).toHaveAttribute(
      "href",
      "https://apps.apple.com/us/app/the-palace-project/id1574359693"
    );

    const googleBadge = screen.getByRole("link", {
      name: "Get Palace on the Google Play Store",
      hidden: true // hidden initially on mobile
    });
    expect(googleBadge).toBeInTheDocument();
    expect(googleBadge).toHaveAttribute(
      "href",
      "https://play.google.com/store/apps/details?id=org.thepalaceproject.palace&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
    );
  });

  test("shows recommendation lanes", () => {
    // we make a special mock so we can differentiate the book request
    // and the related collection request
    mockedSWR.mockImplementation(((key: any) => {
      if (key === "/book-url") {
        return makeSwrResponse({
          data: {
            ...fixtures.book,
            relatedUrl: "/related-url"
          }
        });
      }
      if (key?.[0] === "/related-url") {
        return makeSwrResponse({
          data: fixtures.recommendations
        });
      }
    }) as any);
    setup(<BookDetails />, {
      router: { query: { bookUrl: "/book-url" } }
    });
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Jane Austen collection" })
    ).toBeInTheDocument();
  });

  test("displays breadcrumbs from context", () => {
    mockSwr({
      data: fixtures.book
    });

    // we render a context provider so we can control the value
    setup(
      <BreadcrumbContext.Provider
        value={{
          setStoredBreadcrumbs: jest.fn(),
          storedBreadcrumbs: [
            { text: "breadcrumb title", url: "breadcrumb-url" },
            { text: "breadcrumb title 2", url: "breadcrumb-url-2" }
          ]
        }}
      >
        <BookDetails />
      </BreadcrumbContext.Provider>,
      {
        router: { query: { bookUrl: "/book-url" } }
      }
    );
    expect(
      screen.getByRole("link", { name: "breadcrumb title" })
    ).toHaveAttribute("href", "/testlib/collection/breadcrumb-url");
    expect(
      screen.getByRole("link", { name: "breadcrumb title 2" })
    ).toHaveAttribute("href", "/testlib/collection/breadcrumb-url-2");
    expect(
      screen.getByLabelText(`Current location: ${fixtures.book.title}`)
    ).toBeInTheDocument();
  });
});

/**
 * mock fetchComplaintTypes and postComplaint
 */
const mockBoundFetchComplaintTypes = jest
  .fn()
  .mockResolvedValue(["complaint-type"]);
const fetchComplaintTypesSpy = jest
  .spyOn(complaintActions, "fetchComplaintTypes")
  .mockReturnValue(mockBoundFetchComplaintTypes);
const postComplaintSpy = jest.spyOn(complaintActions, "postComplaint");

const bookWithReportUrl = merge<AnyBook>(fixtures.book, {
  raw: {
    link: [
      {
        $: {
          rel: {
            value: "issues"
          },
          href: {
            value: "/report-url"
          }
        }
      }
    ]
  }
});

describe("report problem", () => {
  test("shows report problem link", () => {
    mockSwr({ data: fixtures.book });
    setup(<BookDetails />);

    const reportProblemLink = screen.getByTestId("report-problem-link");
    expect(reportProblemLink).toBeInTheDocument();
  });

  test("shows form (only) when clicked", async () => {
    mockSwr({ data: fixtures.book });
    const { user } = setup(<BookDetails />);
    // make sure it's not visible at first
    expect(screen.getByLabelText("Complaint Type")).not.toBeVisible();

    const reportProblemLink = screen.getByTestId("report-problem-link");
    await user.click(reportProblemLink);

    // one for the original report problem button, one for the form
    expect(screen.getAllByText("Report a problem")).toHaveLength(2);
    expect(screen.getByLabelText("Complaint Type")).toBeVisible();
    expect(screen.getByLabelText("Details")).toBeVisible();
    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Submit")).toBeVisible();
    expect(screen.getByText("Submit")).toHaveAttribute("type", "submit");
  });

  test("fetches complaint types", async () => {
    mockSwr({ data: fixtures.book });
    render(<BookDetails />);
    expect(mockBoundFetchComplaintTypes).toHaveBeenCalledTimes(1);
    expect(mockBoundFetchComplaintTypes).toHaveBeenCalledWith("/report-url");
  });

  test("submits", async () => {
    /**
     * Mock the fetchComplaintTypes function so that it actually
     * loads the complaintTypes into the state, so we can then
     * select them. I tried to mock the state value itself, but that
     * turned out to be quite difficult.
     */
    const complaintTypes = ["complaint-type-a", "complaint-type-b"];
    fetchComplaintTypesSpy.mockImplementationOnce(dispatch => _url => {
      dispatch({
        type: "FETCH_COMPLAINT_TYPES_SUCCESS",
        types: complaintTypes
      });
      return Promise.resolve(complaintTypes);
    });

    const mockBoundPostComplaint = jest.fn().mockResolvedValue(["some-string"]);
    postComplaintSpy.mockReturnValue(_url => mockBoundPostComplaint);

    mockSwr({ data: fixtures.book });
    const { user } = setup(<BookDetails />);
    // open the form
    const reportProblemLink = screen.getByTestId("report-problem-link");
    await user.click(reportProblemLink);

    // fill the form

    await user.selectOptions(
      screen.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    await user.type(screen.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    await user.click(screen.getByText("Submit"));

    // actually posted the complaint
    await waitFor(() =>
      expect(mockBoundPostComplaint).toHaveBeenCalledTimes(1)
    );
    expect(mockBoundPostComplaint).toHaveBeenCalledWith({
      type: "complaint-type-b",
      detail: "Some issue happened."
    });
  });

  test("displays thank you after submitting", async () => {
    const complaintTypes = ["complaint-type-a", "complaint-type-b"];
    fetchComplaintTypesSpy.mockImplementationOnce(dispatch => _url => {
      dispatch({
        type: "FETCH_COMPLAINT_TYPES_SUCCESS",
        types: complaintTypes
      });
      return Promise.resolve(complaintTypes);
    });

    // make postComplaint dispatch a success message
    postComplaintSpy.mockImplementation(dispatch => _url => _data => {
      dispatch({ type: "POST_COMPLAINT_SUCCESS" });
      return Promise.resolve(["some string"] as any);
    });

    mockSwr({ data: fixtures.book });
    const { user } = setup(<BookDetails />);
    // open the form
    const reportProblemLink = screen.getByTestId("report-problem-link");
    await user.click(reportProblemLink);

    // fill the form
    await user.selectOptions(
      screen.getByLabelText("Complaint Type"),
      "complaint-type-b"
    );
    await user.type(screen.getByLabelText("Details"), "Some issue happened.");
    // submit the form
    await user.click(screen.getByText("Submit"));

    // shows thank you message
    expect(
      screen.getByText("Your problem was reported. Thank you!")
    ).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();

    // can close the form
    await user.click(screen.getByText("Done"));
    expect(screen.queryByText("Complaint Type")).not.toBeInTheDocument();
  });

  test("displays client error when unfilled", async () => {
    const mockBoundPostComplaint = jest.fn().mockResolvedValue(["some-string"]);
    postComplaintSpy.mockReturnValue(_url => mockBoundPostComplaint);

    mockSwr({ data: bookWithReportUrl });
    const { user } = setup(<ReportProblem book={fixtures.borrowableBook} />);
    // open the form
    const reportProblemLink = screen.getByTestId("report-problem-link");
    await user.click(reportProblemLink);

    // don't fill the form
    // submit the form
    await user.click(screen.getByText("Submit"));

    expect(
      await screen.findByText("Error: Please choose a type")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Error: Please enter details about the problem.")
    ).toBeInTheDocument();

    expect(mockBoundPostComplaint).toHaveBeenCalledTimes(0);
  });
});
