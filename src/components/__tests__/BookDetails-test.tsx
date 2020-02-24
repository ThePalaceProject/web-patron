import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import BookDetails from "../bookDetails";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import BorrowButton from "opds-web-client/lib/components/BorrowButton";
import RevokeButton from "../RevokeButton";

const book = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary:
    "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  openAccessLinks: [{ url: "secrets.epub", type: "epub" }],
  publisher: "Penguin Publishing Group",
  published: "February 29, 2016",
  categories: ["Children", "10-12", "Fiction", "Adventure", "Fantasy"],
  raw: {
    category: [
      {
        $: {
          scheme: { value: "http://schema.org/audience" },
          label: { value: "Children" }
        }
      },
      {
        $: {
          scheme: { value: "http://schema.org/typicalAgeRange" },
          label: { value: "10-12" }
        }
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/fiction/" },
          label: { value: "Fiction" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Adventure" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Fantasy" }
        }
      }
    ],
    "bibframe:distribution": [
      {
        $: {
          "bibframe:ProviderName": {
            value: "Overdrive"
          }
        }
      }
    ],
    link: [
      {
        $: {
          rel: { value: "issues" },
          href: { value: "http://example.com/report" }
        }
      },
      {
        $: {
          rel: { value: "http://librarysimplified.org/terms/rel/revoke" },
          href: { value: "http://example.com/revoke" }
        }
      }
    ]
  }
};

describe("BookDetails", () => {
  let wrapper;
  const noop = stub().returns(new Promise((resolve, reject) => resolve()));
  const fetchComplaintTypes = noop;
  const postComplaint = noop;
  const problemTypes = ["type1", "type2"];

  beforeEach(() => {
    wrapper = shallow(
      <BookDetails
        book={book}
        updateBook={noop}
        fulfillBook={noop}
        indirectFulfillBook={noop}
        fetchComplaintTypes={fetchComplaintTypes}
        postComplaint={postComplaint}
        problemTypes={problemTypes}
      />
    );
  });

  test("shows audience and target age", () => {
    const audience = wrapper.find(".audience");
    expect(audience.text()).toBe("Audience: Children (age 10-12)");
  });

  test("shows categories", () => {
    const categories = wrapper.find(".categories");
    expect(categories.text()).toBe("Categories: Adventure, Fantasy");
  });

  test("doesn't show categories when there aren't any", () => {
    const bookCopy = Object.assign({}, book, {
      raw: { category: [], link: [] }
    });
    wrapper.setProps({ book: bookCopy });
    const categories = wrapper.find(".categories");
    expect(categories.length).toBe(0);
  });

  test("shows distributor", () => {
    const distributor = wrapper.find(".distributed-by");
    expect(distributor.text()).toBe("Distributed By: Overdrive");
  });

  // test("shows report problem link", () => {
  //   const link = wrapper.find(ReportProblemLink);
  //   expect(link.length).toBe(1);
  //   expect(link.props().reportUrl).toBe("http://example.com/report");
  //   expect(link.props().fetchTypes).toBe(fetchComplaintTypes);
  //   expect(link.props().report).toBe(postComplaint);
  //   expect(link.props().types).toBe(problemTypes);
  // });

  test("shows revoke button if book is open access", () => {
    const button = wrapper.find(RevokeButton);
    expect(button.length).toBe(1);
    expect(button.props().revoke).toBe(wrapper.instance().revoke);
    expect(button.props().children).toBe("Return Now");
  });

  test("doesn't show revoke button if book isn't open access", () => {
    const bookCopy = Object.assign({}, book, { openAccessLinks: [] });
    wrapper = shallow(
      <BookDetails
        book={bookCopy}
        updateBook={noop}
        fulfillBook={noop}
        indirectFulfillBook={noop}
        fetchComplaintTypes={fetchComplaintTypes}
        postComplaint={postComplaint}
        problemTypes={problemTypes}
      />
    );
    const button = wrapper.find(RevokeButton);
    expect(button.length).toBe(0);
  });

  test("shows app info for borrowed book", () => {
    const bookCopy = Object.assign({}, book, {
      openAccessLinks: [],
      fulfillmentLinks: ["http://fulfill"],
      availability: { status: "available" }
    });
    wrapper = shallow(
      <BookDetails
        book={bookCopy}
        updateBook={noop}
        fulfillBook={noop}
        indirectFulfillBook={noop}
        fetchComplaintTypes={fetchComplaintTypes}
        postComplaint={postComplaint}
        problemTypes={problemTypes}
      />
    );
    const appInfo = wrapper.find(".app-info");
    expect(appInfo.length).toBe(1);
    expect(appInfo.text()).toEqual(expect.arrayContaining(["app"]));
  });
});
