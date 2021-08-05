/// <reference types="cypress" />

import { HIGH_SCHOOL_DETAIL_BOOK_PATH_1 } from "../../support/utils";

describe("Report a problem", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });

  it("submits an issue through the modal dialog", () => {
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_1);
    cy.findByRole("button", { name: "Report a problem" })
      .should("exist")
      .click();
    cy.findByRole("dialog", { name: "Report a problem" }).should("exist");
    cy.findByRole("heading", { name: "Report a problem" }).should("exist");
    cy.findByRole("button", { name: "Cancel" }).should("exist");
    cy.findByRole("option", { name: "Cannot Fulfill Loan" }).should("exist");
    cy.findByRole("textbox", { name: "Details" })
      .should("exist")
      .type("frontend cypress test");
    cy.findByRole("button", { name: "Submit" }).should("exist").click();
    cy.findByRole("heading", {
      name: "Your problem was reported. Thank you!"
    }).should("exist");
    cy.findByRole("button", { name: "Done" }).should("exist").click();
    cy.findByRole("dialog", { name: "Report a problem" }).should("not.exist");
  });
});

export {};
