/// <reference types="cypress" />

const allAccessUser = {
  username: "A3IAYP9NDS",
  password: "9864"
};

function generateToken(username: string, password: string) {
  const btoaStr = btoa(`${username}:${password}`);
  return `Basic ${btoaStr}`;
}

describe("Report a problem", () => {
  const token = generateToken(allAccessUser.username, allAccessUser.password);
  const credentials = {
    methodType: "http://opds-spec.org/auth/basic",
    token
  };

  beforeEach(() => {
    cy.setCookie("CPW_AUTH_COOKIE%2Fapp", JSON.stringify(credentials));
  });

  it("submits an issue through the modal dialog", () => {
    cy.visit(
      "/app/book/https%3A%2F%2Fqa-circulation.openebooks.us%2FUSOEI%2Fworks%2FAxis%2520360%2520ID%2F0013213829"
    );
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
