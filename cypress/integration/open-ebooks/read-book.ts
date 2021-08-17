import { LOANS_PATH, SERVER_URL } from "../../support/utils";

describe("Open eBooks Read Online", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });
  it("Read Online button exists and works", () => {
    cy.visit(LOANS_PATH);
    cy.intercept("GET", `${SERVER_URL}/loans`, {
      fixture: "open-ebooks/all-access/loans.html"
    }).as("loans");
    cy.wait("@loans");
    cy.findAllByText("Ready to Read!").should("have.length", 3);
  });
});

export {};
