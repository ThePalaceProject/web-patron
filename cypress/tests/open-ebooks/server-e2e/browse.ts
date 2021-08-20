/// <reference types="cypress" />

import {
  APP_PATH,
  HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH,
  HIGH_SCHOOL_COLLECTION_PATH,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED,
  HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
} from "../../../support/utils";

describe("All-access browsing", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });

  it("Can browse collections", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findAllByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Click the high school see more button
    cy.findByRole("link", { name: "See more: High School collection" }).click();

    // Verify we have navigated to the High School lane
    cy.location("pathname").should("contain", HIGH_SCHOOL_COLLECTION_PATH);

    // Verify the high school heading is there and staff picks
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.findByRole("heading", { name: "Staff Picks collection" }).should(
      "exist"
    );

    cy.findByRole("link", { name: "See more: Staff Picks collection" })
      .should("exist")
      .click();

    // Make sure we changed to the new collection page
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
    );
    // Verify we are at the book list view
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");

    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.length.at.least", 1);

    cy.findAllByText("Available to borrow").should("have.length.at.least", 1);
    cy.findAllByRole("button", { name: "Borrow this book" }).should(
      "have.length.at.least",
      1
    );
  });

  it("Can browse recommendations", () => {
    // Navigate to "Recommendations" page
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH
    );
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.length.at.least", 1);
  });

  it("Can view book details", () => {
    // Navigate to a book page
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED
    );
    // View book details
    cy.findByText("Available to borrow").should("exist");
    cy.findByRole("button", { name: "Borrow this book" }).should("exist");
    cy.findByText("Summary").should("exist");
    cy.findByRole("button", { name: "Report a problem" }).should("exist");
    cy.findByRole("heading", { name: "Recommendations" }).should("exist");
  });

  it("Can navigate through breadcrumbs", () => {
    // Navigate to the root /app
    cy.visit(APP_PATH);
    // Navigate to a book detail vieew through several collection paths
    cy.findByRole("link", { name: "See more: High School collection" }).click();
    cy.findByRole("link", { name: "See more: Staff Picks collection" }).click();
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
    cy.findByRole("link", {
      name: "Staff Picks"
    })
      .should("exist")
      .click();
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");
    cy.findByRole("link", {
      name: "Book"
    })
      .should("exist")
      .click();
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.findByRole("listitem", {
      name: "Current location: High School"
    }).should("exist");
    cy.findByRole("link", {
      name: "All Books"
    })
      .should("exist")
      .click();
    // Verify base collection title
    cy.findAllByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );
  });
});

export {};
