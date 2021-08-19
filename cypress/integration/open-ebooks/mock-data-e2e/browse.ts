/// <reference types="cypress" />
import {
  APP_PATH,
  SERVER_URL,
  HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH,
  HIGH_SCHOOL_COLLECTION_PATH,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION,
  HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
} from "../../../support/utils";

describe("All-access browsing", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");

    // all intercepts need to come before the actual requests, so we will mock them out here first
    cy.intercept("GET", `${SERVER_URL}/groups`, {
      fixture: "open-ebooks/all-access/all-collections.html"
    }).as("allCollections");

    cy.intercept("GET", `${SERVER_URL}/groups/406?entrypoint=Book`, {
      fixture: "open-ebooks/high-school/collection-high-school.html"
    }).as("highSchoolCollection");

    cy.intercept("GET", `${SERVER_URL}/feed/407?entrypoint=Book`, {
      fixture: "open-ebooks/high-school/staff-picks.html"
    }).as("staffPicks");

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0013217610/related_books`,
      {
        fixture: "open-ebooks/high-school/book-heart-of-a-champion.html"
      }
    ).as("heartOfAChampionBook");

    cy.intercept("GET", `${SERVER_URL}/feed/407?entrypoint=Book`, {
      fixture: "open-ebooks/high-school/staff-picks.html"
    }).as("staffPicks");

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0015470129/related_books`,
      {
        fixture: "open-ebooks/high-school/book-betrayed.html"
      }
    ).as("betrayedBook");

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/contributor/Rush%2C%20Jennifer/eng/All%2BAges%2CChildren%2CYoung%2BAdult
                `,
      {
        fixture: "open-ebooks/high-school/jennifer-rush-recommendations.html"
      }
    ).as("recommendations");

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0013215327/related_books`,
      {
        fixture: "open-ebooks/high-school/book-altered.html"
      }
    ).as("alteredBook");
  });

  it("Can browse collections", () => {
    cy.visit(APP_PATH);
    cy.wait("@allCollections");

    // Verify collection title
    cy.findAllByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Click the high school see more button
    cy.findByRole("link", { name: "See more: High School collection" }).click();
    cy.wait("@highSchoolCollection");

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
    cy.wait("@staffPicks");

    // Make sure we changed to the new collection page
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_STAFF_PICKS_COLLECTION_PATH
    );
    // Verify we are at the book list view
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");

    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.length", 20);

    // Verify book list content
    cy.findByRole("listitem", { name: "Book: Heart of a Champion" })
      .should("exist")
      .within(() => {
        cy.findByRole("heading", { name: "Heart of a Champion" }).should(
          "exist"
        );
        cy.findAllByRole("img", {
          name: "Cover of book: Heart of a Champion"
        }).should("exist", 2);
        cy.findByText("Deuker, Carl").should("exist");
        cy.findByText("Available to borrow").should("exist");
        cy.findByText("9999 out of 9999 copies available.").should("exist");
        cy.findAllByText(
          "Seth faces a strain on his friendship with Jimmy, who is both a baseball champion and something of an irresponsible fool, when Jimmy is kicked off the team."
        ).should("exist", 2);
        cy.findByRole("button", { name: "Borrow this book" }).should("exist");
        cy.findByRole("link", { name: "Read more" }).should("exist");
      });
  });

  it("Can browse recommendations", () => {
    // Navigate to "Recommendations" page
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.wait("@recommendations");

    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH
    );
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    // Verify a list of books is displayed
    cy.get("[data-testid=listview-list]").find("li").as("bookList");
    cy.get("@bookList").should("have.lengthOf", 3);
  });

  it("Can view book details", () => {
    // Navigate to a book page
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION);
    cy.wait("@heartOfAChampionBook");
    cy.location("pathname").should(
      "contain",
      HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION
    );
    // View book details
    cy.findByRole("listitem", {
      name: "Current location: Heart of a Champion"
    }).should("exist");
    cy.findByRole("heading", { name: "Heart of a Champion" }).should("exist");
    cy.findByText("Hachette Book Group USA").should("exist");
    cy.findByText("May 30, 2009").should("exist");
    cy.findByText("Fiction, Young Adult, 12-14").should("exist");
    cy.findByRole("button", { name: "Report a problem" }).should("exist");
    cy.findByText("Available to borrow").should("exist");
    cy.findByRole("button", { name: "Borrow this book" }).should("exist");
    cy.findByText("Summary").should("exist");
  });

  it("Can navigate through breadcrumbs", () => {
    // navigate to the root /app
    cy.visit(APP_PATH);
    cy.wait("@allCollections");
    // Navigate to a book detail vieew through several collection paths
    cy.findByRole("link", { name: "See more: High School collection" }).click();
    cy.wait("@highSchoolCollection");
    cy.findByRole("link", { name: "See more: Staff Picks collection" }).click();
    cy.wait("@staffPicks");
    cy.findByRole("link", { name: "View Betrayed" }).click();
    cy.wait("@betrayedBook");
    // Verify breadcrumbs list exists
    cy.get("[data-testid=breadcrumbs-list]").find("li").as("breadcrumbsList");
    cy.get("@breadcrumbsList").should("have.lengthOf", 4);
    // Navigate back through breadrumbs
    cy.findByRole("link", {
      name: "Staff Picks"
    })
      .should("exist")
      .click();
    cy.wait("@staffPicks");
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");
    cy.findByRole("link", {
      name: "Book"
    })
      .should("exist")
      .click();
    cy.wait("@highSchoolCollection");
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.findByRole("listitem", {
      name: "Current location: High School"
    }).should("exist");
    cy.findByRole("link", {
      name: "All Books"
    })
      .should("exist")
      .click();
    cy.wait("@allCollections");
    // Verify base collection title
    cy.findAllByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );
  });
});

export {};
