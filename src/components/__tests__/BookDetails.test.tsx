import * as React from "react";
import { render, fixtures } from "../../test-utils";
import { stub } from "sinon";

import { shallow } from "enzyme";

import BookDetails from "../bookDetails";

const book = fixtures.book;

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
