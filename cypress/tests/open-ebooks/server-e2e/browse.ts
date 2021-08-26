/// <reference types="cypress" />

import {
  APP_PATH,
  ALL_ACCESS_INTEGRATION_TESTING_COLLECTION_PATH,
  ALL_ACCESS_AUTHOR_RECOMMENDATIONS_PATH_HUNTER_C_C,
  ALL_ACCESS_DETAIL_BOOK_PATH_ALMOST_MIDNIGHT
} from "../../../support/utils";

describe("All-access browsing", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });

  it("Can browse collections", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");

    // Click the books for integration testing see more button
    cy.findByRole("link", {
      name: "See more: Books for integration testing collection"
    }).click();

    // Verify we have navigated to the testing lane
    cy.location("pathname").should(
      "contain",
      ALL_ACCESS_INTEGRATION_TESTING_COLLECTION_PATH
    );

    // Verify the heading is there
    cy.findByRole("heading", {
      name: "Books for integration testing"
    }).should("exist");

    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.length.at.least", 1);

    cy.findAllByText("Available to borrow").should("have.lengthOf", 5);
    cy.findAllByRole("button", { name: "Borrow this book" }).should(
      "have.lengthOf",
      5
    );
    cy.findAllByRole("link", { name: "Almost Midnight" }).should("exist", 2);
    cy.findAllByAltText("Cover of book: Almost Midnight").should("exist");
  });

  it("Can browse recommendations", () => {
    // Navigate to "Recommendations" page
    cy.visit(ALL_ACCESS_AUTHOR_RECOMMENDATIONS_PATH_HUNTER_C_C);
    cy.location("pathname").should(
      "contain",
      ALL_ACCESS_AUTHOR_RECOMMENDATIONS_PATH_HUNTER_C_C
    );
    cy.findByRole("heading", { name: "Hunter, C. C." }).should("exist");
    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.lengthOf", 2);
    cy.findAllByText("Available to borrow").should("have.lengthOf", 2);
    cy.findAllByRole("button", { name: "Borrow this book" }).should(
      "have.lengthOf",
      2
    );
    cy.findAllByAltText("Cover of book: Almost Midnight").should("exist");
    cy.findAllByAltText("Cover of book: Midnight Hour").should("exist");
  });

  it("Can view book details", () => {
    // Navigate to a book page
    cy.visit(ALL_ACCESS_DETAIL_BOOK_PATH_ALMOST_MIDNIGHT);
    cy.location("pathname").should(
      "contain",
      ALL_ACCESS_DETAIL_BOOK_PATH_ALMOST_MIDNIGHT
    );
    // View book details
    cy.findByRole("heading", { name: "Almost Midnight" }).should("exist");
    cy.findAllByAltText("Cover of book: Almost Midnight").should("exist");
    cy.findByText("Available to borrow").should("exist");
    cy.findByRole("button", { name: "Borrow this book" }).should("exist");
    cy.findByText("Summary").should("exist");
    cy.findByRole("button", { name: "Report a problem" }).should("exist");
    cy.findByRole("heading", { name: "Recommendations" }).should("exist");
  });

  it("Can navigate through breadcrumbs", () => {
    // Navigate to the root /app
    cy.visit(APP_PATH);

    // Navigate to a book detail view through collection paths
    cy.findByRole("link", {
      name: "See more: Books for integration testing collection"
    }).click();
    cy.get("[data-testid=listview-list]")
      .find("li")
      .first()
      .find("a")
      .first()
      .click();

    // Verify breadcrumbs list exists
    cy.get("[data-testid=breadcrumbs-list]").find("li").as("breadcrumbsList");
    cy.get("@breadcrumbsList").should("have.lengthOf", 4);

    // Navigate back through breadrumbs
    cy.findByRole("link", { name: "Books for integration testing" })
      .should("exist")
      .click();
    cy.findByRole("heading", { name: "Books for integration testing" }).should(
      "exist"
    );
    cy.findByRole("link", {
      name: "Book"
    })
      .should("exist")
      .click();
    cy.findByRole("listitem", {
      name: "Current location: Open eBooks (QA Server)"
    }).should("exist");
    cy.findByRole("link", {
      name: "All Books"
    })
      .should("exist")
      .click();

    // Verify base collection titles and lanes
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server)" })
      .should("exist");
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "exist"
    );
  });
});

export {};
