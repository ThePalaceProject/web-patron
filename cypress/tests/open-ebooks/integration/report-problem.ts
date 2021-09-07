/// <reference types="cypress" />

import {
  HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION,
  SERVER_URL
} from "../../../support/utils";

describe("Report a problem", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");

    cy.intercept(
      "POST",
      `${SERVER_URL}/works/Axis%20360%20ID/0013217610/report`,
      {
        fixture: "open-ebooks/report-problem-form.json"
      }
    ).as("submission");

    cy.intercept(
      "GET",
      `${SERVER_URL}/works/Axis%20360%20ID/0013217610/related_books`,
      {
        fixture: "open-ebooks/high-school/book-heart-of-a-champion.html"
      }
    ).as("book");
  });

  it("submits an issue through the modal dialog", () => {
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION);
    cy.wait("@book");

    cy.log("verify that the modal should not yet exist in the DOM");
    cy.findByRole("dialog", { name: "Report a problem" }).should("not.exist");
    cy.findByRole("button", { name: "Report a problem" })
      .should("exist")
      .click();

    cy.log("now the modal should exist");
    cy.findByRole("dialog", { name: "Report a problem" }).should("exist");
    cy.findByRole("heading", { name: "Report a problem" }).should("exist");
    cy.findByRole("button", { name: "Cancel" }).should("exist");
    cy.findByRole("option", { name: "Cannot Fulfill Loan" }).should("exist");
    cy.findByRole("textbox", { name: "Details" })
      .should("exist")
      .type("frontend cypress test");
    cy.findByRole("button", { name: "Submit" }).should("exist").click();
    cy.wait("@submission");
    cy.findByRole("heading", {
      name: "Your problem was reported. Thank you!"
    }).should("exist");
    cy.findByRole("button", { name: "Done" }).should("exist").click();
    cy.findByRole("dialog", { name: "Report a problem" }).should("not.exist");
  });
});

export {};
