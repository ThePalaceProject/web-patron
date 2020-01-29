import { expect } from "chai";
import { bookFixture } from "./../../__tests__/fixtures/book";
import { getAuthors } from "src/utils/book";
describe("book utils", () => {
  /**
   * returns all authors default
   * returns limited number of authors
   * returns contributors if no authors
   * returns "Authors unknown" when neither
   */
  const someAuthors = ["Peter sieger", "Jeff", "Alan turing", "Boris Johnson"];
  it("returns all authors default", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book)).to.equal(someAuthors);
  });

  it("returns limited number of authors when requested", () => {
    const book = {
      ...bookFixture,
      authors: someAuthors
    };
    expect(getAuthors(book, 2)).to.equal(["Peter sieger", "Jeff"]);
  });

  it("returns contributors if no authors", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: someAuthors
    };
    expect(getAuthors(book)).to.equal(someAuthors);
  });

  it("returns 'Authors unknown' when neither authors nor contributors provided", () => {
    const book = {
      ...bookFixture,
      authors: [],
      contributors: []
    };
    expect(getAuthors(book)).to.equal(["Authors unknown"]);
  });
});
