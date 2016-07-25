import { expect } from "chai";
import { spy, stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import BookDetails from "../BookDetails";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import BorrowButton from "opds-web-client/lib/components/BorrowButton";

let book = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary: "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  openAccessUrl: "secrets.epub",
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
          scheme: { value: "http://librarysimplified.org/terms/genres/Simplified/" },
          label: { value: "Adventure" }
        }
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/genres/Simplified/" },
          label: { value: "Fantasy" }
        }
      }
    ],
    link: []
  }
};

describe("BookDetails", () => {
  let wrapper;
  let noop = (url: string) => new Promise((resolve, reject) => resolve());

  beforeEach(() => {
    wrapper = shallow(
      <BookDetails
        book={book}
        borrowAndFulfillBook={noop}
        fulfillBook={noop}
        />
    );
  });

  it("shows cover", () => {
    let coverImage = wrapper.find("img");
    expect(coverImage.props().src).to.equal(book.imageUrl);
  });

  it("shows title", () => {
    let title = wrapper.find("h1");
    expect(title.text()).to.equal(book.title);
  });

  it("shows authors", () => {
    let author = wrapper.find(".bookDetailsAuthors");
    expect(author.text()).to.equal(book.authors.join(", "));
  });

  it("shows contributors", () => {
    let contributor = wrapper.find(".bookDetailsContributors");
    expect(contributor.text()).to.equal("Contributors: " + book.contributors.join(", "));
  });

  it("shows publisher", () => {
    let publisher = wrapper.find(".bookDetailsPublisher");
    expect(publisher.text()).to.equal("Publisher: " + book.publisher);
  });

  it("doesn't show publisher when there isn't one", () => {
    let bookCopy = Object.assign({}, book, {
      publisher: null
    });
    wrapper = shallow(
      <BookDetails
        book={bookCopy}
        borrowAndFulfillBook={noop}
        fulfillBook={noop}
        />
    );

    let publisher = wrapper.find(".bookDetailsPublisher");
    expect(publisher.length).to.equal(0);
  });

  it("shows publish date", () => {
    let published = wrapper.find(".bookDetailsPublished");
    expect(published.text()).to.equal("Published: " + book.published);
  });

  it("shows audience and target age", () => {
    let audience = wrapper.find(".bookDetailsAudience");
    expect(audience.text()).to.equal("Audience: Children (age 10-12)");
  });

  it("shows categories", () => {
    let categories = wrapper.find(".bookDetailsCategories");
    expect(categories.text()).to.equal("Categories: Adventure, Fantasy");
  });

  it("doesn't show categories when there aren't any", () => {
    let bookCopy = Object.assign({}, book, { raw: { category: [], link: [ ]} });
    wrapper = shallow(
      <BookDetails
        book={bookCopy}
        borrowAndFulfillBook={noop}
        fulfillBook={noop}
        />
    );

    let categories = wrapper.find(".bookDetailsCategories");
    expect(categories.length).to.equal(0);
  });

  it("shows summary", () => {
    let summary = wrapper.find(".bookDetailsSummary");
    expect(summary.html()).to.contain("Sam and Remi");
  });

  it("shows permalink", () => {
    let permalink = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "Permalink");
    expect(permalink.length).to.equal(1);
    expect(permalink.props().bookUrl).to.equal(book.url);
    expect(permalink.props().catalogUrl).to.be.undefined;
  });

  it("shows only borrow button if there's a borrow url and open access url", () => {
    let borrowAndFulfillBook = noop;
    wrapper = shallow(
      <BookDetails
        book={book}
        borrowAndFulfillBook={borrowAndFulfillBook}
        fulfillBook={noop} />
    );

    let button = wrapper.find(BorrowButton);
    expect(button.children().text()).to.equal("Borrow");
    expect(button.props().book).to.equal(book);
    expect(button.props().borrow).to.equal(borrowAndFulfillBook);

    let download = wrapper.find("a.btn");
    expect(download.length).to.equal(0);
  });

  it("shows download button if there's no borrow url", () => {
    let bookCopy = Object.assign({}, book, {
      borrowUrl: null
    });
    wrapper.setProps({ book: bookCopy });
    let button = wrapper.find("a.btn");
    expect(button.text()).to.equal("Download");
    expect(button.props().href).to.equal("secrets.epub");
    let borrow = wrapper.find(BorrowButton);
    expect(borrow.length).to.equal(0);
  });
});