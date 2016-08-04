import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import BookDetailsContainer from "../BookDetailsContainer";
import BookDetails from "../BookDetails";

let book = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary: "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  raw: {}
};

class DefaultBookDetails extends React.Component<any, any> {
  render() {
    return <div></div>;
  }
}

describe("BookDetailsContainer", () => {
  it("renders BookDetails with its child's props", () => {
    let borrowBook = url => Promise.resolve();
    let fulfillBook = url => Promise.resolve();
    let wrapper = shallow(
      <BookDetailsContainer
        book={book}
        bookUrl="book url"
        collectionUrl="collection url"
        refreshCatalog={() => Promise.resolve()}
        >
        <DefaultBookDetails
          book={book}
          borrowBook={borrowBook}
          fulfillBook={fulfillBook}
          isSignedIn={true}
          />
      </BookDetailsContainer>
    );

    let bookDetails = wrapper.find(BookDetails);
    expect(bookDetails.prop("book")).to.equal(book);
    expect(bookDetails.prop("borrowBook")).to.equal(borrowBook);
    expect(bookDetails.prop("fulfillBook")).to.equal(fulfillBook);
    expect(bookDetails.prop("isSignedIn")).to.equal(true);
  });
});