describe("App loads", () => {
  it("Home page shows sign in options", () => {
    cy.visit("/");
    cy.findByRole("link", { name: "Login with First Book" }).should("exist");
  });
});

export {};
