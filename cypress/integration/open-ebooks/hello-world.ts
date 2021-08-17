describe("Open eBooks Read Online", () => {
  /**
   * We will have to mock the server response for this so that there is
   * always a checked out book viewable.
   */
  it("home page shows sign in options", () => {
    cy.visit("/");

    cy.findByRole("link", { name: "Login with First Book" }).should("exist");

    // to be continued...
  });
});

export {};
