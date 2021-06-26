describe("Open eBooks Login Flow", () => {
  it("login flow exists", () => {
    cy.visit("/");
    cy.contains("Welcome to Open eBooks");
    // home page has login buttons
    cy.findByRole("link", { name: "Login with Clever" }).should("exist");
    cy.findByRole("link", { name: "Login with First Book" }).should("exist");

    // can also click the login button in the header
    cy.findByRole("link", { name: "Log In" }).click();
    cy.location("pathname").should("eq", "/app/login");
    cy.get("Welcome to Open eBooks").should("not.exist");

    // clever and firstbook buttons exist on the login page
    cy.findByRole("link", { name: "Login with Clever" }).should("exist");
    cy.findByRole("link", { name: "Login with First Book" })
      .should("exist")
      .click();

    // should be on clever page now
    cy.location("pathname").should(
      "contain",
      "/app/login/http%3A%2F%2Fopds-spec.org%2Fauth%2Fbasic"
    );
    cy.findByRole("textbox", { name: "Access Code input" }).should("exist");
    cy.findByRole("button", { name: "Login" }).should("exist");
    // can get back to the login selection page
    cy.findByRole("link", { name: "Use a different login method" })
      .should("exist")
      .click();

    //
  });

  it.only("can log in with firstbook", () => {
    cy.visit("/");
    cy.findByRole("link", { name: "Login with First Book" }).click();

    cy.findByRole("textbox", { name: "Access Code input" }).type("A3IAYP9NDS");
    cy.findByLabelText("PIN input").type("9864");
    cy.findByRole("button", { name: "Login" }).click();
    cy.location("pathname").should("eq", "/app");
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Open eBooks (QA Server) Home" }).should(
      "exist"
    );

    // then sign out
    cy.findByRole("button", { name: "Log out" }).should("exist").click();
    cy.location("pathname").should("eq", "/app/login");
  });
});

export {};
