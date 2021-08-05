/// <reference types="cypress" />

import {
  APP_PATH,
  HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH,
  HIGH_SCHOOL_COLLECTION_PATH,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_1,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_2,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_3,
  HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
} from "../../support/utils";

describe("All-access browsing", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });

  it("can browse all collections and view books", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
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

    // Click on another see more
    cy.findByRole("link", { name: "See more: Staff Picks collection" }).click();

    // Make sure we changed to the new collection page
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
    );
    // Verify we are at the book list view
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");

    // Find a book to click on
    cy.findByRole("listitem", { name: "Book: Heart of a Champion" })
      .should("exist")
      .within(() => {
        cy.findByRole("heading", { name: "Heart of a Champion" }).should(
          "exist"
        );
        cy.findByText("Deuker, Carl").should("exist");
        cy.findByText("Available to borrow").should("exist");
        cy.findByText("9999 out of 9999 copies available.").should("exist");
        cy.findAllByText(
          "Seth faces a strain on his friendship with Jimmy, who is both a baseball champion and something of an irresponsible fool, when Jimmy is kicked off the team."
        ).should("exist", 2);
        cy.findByRole("button", { name: "Borrow this book" }).should("exist");

        // Verify that the read more button works
        cy.findByRole("link", { name: "Read more" }).should("exist").click();
      });

    // Verify we are at the book detail view
    cy.location("pathname").should("contain", HIGH_SCHOOL_DETAIL_BOOK_PATH_1);
    cy.findByRole("listitem", {
      name: "Current location: Heart of a Champion"
    }).should("exist");
    cy.findByRole("heading", { name: "Heart of a Champion" }).should("exist");
    cy.findByText("Hachette Book Group USA").should("exist");
    cy.findByText("May 30, 2009").should("exist");
    cy.findByText("Fiction, Young Adult, 12-14").should("exist");
    cy.findByRole("button", { name: "Report a problem" }).should("exist");

    // "Recommendations" swimlane does not render for this book
    cy.findByRole("heading", { name: "Recommendations" }).should("not.exist");

    // Navigate back to "Staff Picks" using breadcrumbs
    cy.findByRole("link", { name: "Staff Picks" }).click();

    // Click new book and render detail view
    cy.findByRole("listitem", { name: "Book: Betrayed" })
      .should("exist")
      .within(() => {
        // Verify that the read more button works
        cy.findByRole("link", { name: "Read more" }).should("exist").click();
      });
    cy.location("pathname").should("contain", HIGH_SCHOOL_DETAIL_BOOK_PATH_2);

    // Verify we are at the book detail view
    cy.findByRole("listitem", {
      name: "Current location: Betrayed"
    }).should("exist");

    // "Recommendations" swimlane does render for this book
    cy.findByRole("heading", { name: "Recommendations" }).should("exist");
    cy.findByRole("heading", { name: "Rush, Jennifer collection" }).should(
      "exist"
    );
    cy.findByRole("link", { name: "See more: Rush, Jennifer collection" })
      .should("exist")
      .click();

    // Navigate to "Recommendations" page
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH
    );
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    cy.findAllByRole("img", { name: "Cover of book: Altered" })
      .should("exist", 2)
      .first()
      .click();

    // Navigate to detail page
    cy.location("pathname").should("contain", HIGH_SCHOOL_DETAIL_BOOK_PATH_3);
    cy.findByRole("listitem", { name: "Current location: Altered" }).should(
      "exist"
    );

    // Navigate back through breadcrumbs
    cy.findByRole("link", { name: "Book" }).should("exist").click();
    cy.findByRole("listitem", {
      name: "Current location: Open eBooks (QA Server)"
    }).should("exist");
  });
});

export {};
