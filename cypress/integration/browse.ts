/// <reference types="cypress" />
// import { generateToken } from "auth/useCredentials";

const allAccessUser = {
  username: "A3IAYP9NDS"
};

const highSchoolUser = {
  username: "HMN4IIRXX5"
};

const middleGradesUser = {
  username: "MX8GNTIL6I"
};

const earlyGradesUser = {
  username: "EMNK6TDG4R"
};

/**
 * TODO:
 *  - Separate navigating to "Recommendations" from the rest of the browsing?
 *  - Import `generateToken` instead of copying it here. This will likely require some changes to webpack in next.config.js.
 *  - Move usernames to Cypress config and passwords noted in google doc? Talk with team about the best solution here: https://glebbahmutov.com/blog/keep-passwords-secret-in-e2e-tests/
 */

function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}

describe("All-access browsing", () => {
  const token = generateToken(allAccessUser.username, allAccessUser.password);
  const credentials = {
    methodType: "http://opds-spec.org/auth/basic",
    token
  };

  beforeEach(() => {
    cy.clearCookie("CPW_AUTH_COOKIE%2Fapp");
    cy.setCookie("CPW_AUTH_COOKIE%2Fapp", JSON.stringify(credentials));
  });

  it("can browse all collections and view books", () => {
    cy.visit("/app");

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Verify all level lanes are present
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "exist"
    );

    // Click the high school Staff Picks see more button
    cy.findByRole("link", { name: "See more: High School collection" }).click();

    // Verify we have navigated to the High School lane
    cy.location("pathname").should(
      "contain",
      "/app/collection/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fgroups%2F406%3Fentrypoint%3DBook"
    );

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
      "/app/collection/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Ffeed%2F407%3Fentrypoint%3DBook"
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
    cy.location("pathname").should(
      "contain",
      "/app/book/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F00132176"
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

    // Click new book and render detail view
    cy.findByRole("listitem", { name: "Book: Betrayed" })
      .should("exist")
      .within(() => {
        // Verify that the read more button works
        cy.findByRole("link", { name: "Read more" }).should("exist").click();
      });
    cy.location("pathname").should(
      "contain",
      "/app/book/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0015470129"
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
    cy.location("pathname").should(
      "contain",
      "/app/collection/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2Fcontributor%2FRush%252C%2520Jennifer%2Feng%2FAll%252BAges%252CChildren%252CYoung%252BAdult"
    );
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    cy.findAllByRole("img", { name: "Cover of book: Altered" })
      .should("exist", 2)
      .first()
      .click();

    // Navigate to detail page
    cy.location("pathname").should(
      "contain",
      "/app/book/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0013215327"
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

describe("High school access browsing", () => {
  const token = generateToken(highSchoolUser.username, highSchoolUser.password);
  const credentials = {
    methodType: "http://opds-spec.org/auth/basic",
    token
  };

  beforeEach(() => {
    cy.clearCookie("CPW_AUTH_COOKIE%2Fapp");
    cy.setCookie("CPW_AUTH_COOKIE%2Fapp", JSON.stringify(credentials));
  });

  it("can browse books for high school grades", () => {
    cy.visit("/app");

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Verify all access lanes are not present
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    // Veryify high school lane headings are present
    cy.findByRole("heading", { name: "Staff Picks collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Action & Adventure collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Biographies collection" }).should(
      "exist"
    );
    cy.findByRole("heading", {
      name: "Fantasy collection"
    }).should("exist");
    cy.findByRole("heading", {
      name: "Historical Fiction collection"
    }).should("exist");
    cy.findByRole("heading", { name: "Mysteries collection" }).should("exist");
    cy.findByRole("heading", { name: "Science Fiction collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Romance collection" }).should("exist");
    cy.findByRole("heading", { name: "Fiction collection" }).should("exist");
    cy.findByRole("heading", { name: "Nonfiction collection" }).should("exist");
    cy.findByRole("heading", { name: "All High School collection" }).should(
      "exist"
    );

    // Verify early and middle grade lanes are not present
    cy.findByRole("heading", { name: "Animals collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Chapter Books collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Humorous collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Informational Books collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Comics collection" }).should("not.exist");
    cy.findByRole("heading", { name: "All Early Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "All Middle Grades collection" }).should(
      "not.exist"
    );
  });
});

describe("Middle grades access browsing", () => {
  const token = generateToken(
    middleGradesUser.username,
    middleGradesUser.password
  );
  const credentials = {
    methodType: "http://opds-spec.org/auth/basic",
    token
  };

  beforeEach(() => {
    cy.clearCookie("CPW_AUTH_COOKIE%2Fapp");
    cy.setCookie("CPW_AUTH_COOKIE%2Fapp", JSON.stringify(credentials));
  });

  it("can browse books for middle grades", () => {
    cy.visit("/app");

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Verify all access lanes are not present
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    // Veryify middle grades lane headings are present
    cy.findByRole("heading", { name: "Staff Picks collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Action & Adventure collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Biographies collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Comics collection" }).should("exist");
    cy.findByRole("heading", {
      name: "Fantasy collection"
    }).should("exist");
    cy.findByRole("heading", {
      name: "Historical Fiction collection"
    }).should("exist");
    cy.findByRole("heading", { name: "Humor collection" }).should("exist");
    cy.findByRole("heading", { name: "Mysteries collection" }).should("exist");
    cy.findByRole("heading", { name: "Science Fiction collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Fiction collection" }).should("exist");
    cy.findByRole("heading", { name: "Informational Books collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "All Middle Grades collection" }).should(
      "exist"
    );

    // Verify early grade and high school lanes are not present
    cy.findByRole("heading", { name: "Animals collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Chapter Books collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Humorous collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Romance collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Nonfiction collection" }).should(
      "not.exist"
    );

    cy.findByRole("heading", { name: "All High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "All Early Grades collection" }).should(
      "not.exist"
    );
  });
});

describe("Early grades access browsing", () => {
  const token = generateToken(
    earlyGradesUser.username,
    earlyGradesUser.password
  );
  const credentials = {
    methodType: "http://opds-spec.org/auth/basic",
    token
  };

  beforeEach(() => {
    cy.clearCookie("CPW_AUTH_COOKIE%2Fapp");
    cy.setCookie("CPW_AUTH_COOKIE%2Fapp", JSON.stringify(credentials));
  });

  it("can browse books for early grades", () => {
    cy.visit("/app");

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Verify all access lanes are not present
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    // Veryify early grade collection lane headings are present
    cy.findByRole("heading", { name: "Action & Adventure collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Animals collection" }).should("exist");
    cy.findByRole("heading", { name: "Biographies collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Chapter Books collection" }).should(
      "exist"
    );
    cy.findByRole("heading", {
      name: "Fantasy, Fairy Tales, & Science Fiction collection"
    }).should("exist");
    cy.findByRole("heading", { name: "Humorous collection" }).should("exist");
    cy.findByRole("heading", { name: "Mysteries collection" }).should("exist");
    cy.findByRole("heading", { name: "Fiction collection" }).should("exist");
    cy.findByRole("heading", { name: "Informational Books collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "All Early Grades collection" }).should(
      "exist"
    );

    // Verify middle and high school collection lanes are not present
    cy.findByRole("heading", { name: "Romance collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Nonfiction collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Historical Fiction collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Comics collection" }).should("not.exist");
    cy.findByRole("heading", { name: "All High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "All Middle Grades collection" }).should(
      "not.exist"
    );
  });
});

export {};
