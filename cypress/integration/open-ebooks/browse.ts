/// <reference types="cypress" />

import {
  APP_PATH,
  SERVER_URL,
  HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH,
  HIGH_SCHOOL_COLLECTION_PATH,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_BETRAYED,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED,
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
    cy.intercept("GET", `${SERVER_URL}/feed/407?entrypoint=Book`, {
      fixture: "open-ebooks/high-school/staff-picks.html"
    }).as("staffPicks");
    cy.wait("@staffPicks");

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

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0013217610/related_books`,
      {
        fixture: "open-ebooks/high-school/book-heart-of-a-champion.html"
      }
    ).as("heartOfAChampionBook");
    cy.wait("@heartOfAChampionBook");

    // Verify we are at the book detail view
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION
    );
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

    cy.intercept("GET", `${SERVER_URL}/feed/407?entrypoint=Book`, {
      fixture: "open-ebooks/high-school/staff-picks.html"
    }).as("staffPicks");
    cy.wait("@staffPicks");

    // Click new book and render detail view
    cy.findByRole("listitem", { name: "Book: Betrayed" })
      .should("exist")
      .within(() => {
        // Verify that the read more button works
        cy.findByRole("link", { name: "Read more" }).should("exist").click();
      });
    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0015470129/related_books`,
      {
        fixture: "open-ebooks/high-school/book-betrayed.html"
      }
    ).as("betrayedBook");
    cy.wait("@betrayedBook");
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_DETAIL_BOOK_PATH_BETRAYED
    );

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
    cy.intercept(
      "GET",
      `${SERVER_URL}/works/contributor/Rush%2C%20Jennifer/eng/All%2BAges%2CChildren%2CYoung%2BAdult
      `,
      {
        fixture: "open-ebooks/high-school/jennifer-rush-recommendations.html"
      }
    ).as("recommendations");
    cy.wait("@recommendations");

    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH
    );
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    cy.findAllByRole("img", { name: "Cover of book: Altered" })
      .should("exist", 2)
      .first()
      .click();

    // Navigate to detail page
    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0013215327/related_books`,
      {
        fixture: "open-ebooks/high-school/book-altered.html"
      }
    ).as("alteredBook");
    cy.wait("@alteredBook");
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED
    );
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
