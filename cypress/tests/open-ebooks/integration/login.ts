import {
  APP_PATH,
  COOKIE_KEY,
  FIRSTBOOK_LOGIN_PATH,
  LOGIN_PATH,
  SERVER_URL
} from "../../../support/utils";

describe("Open eBooks login flow", () => {
  beforeEach(() => {
    cy.clearCookie(COOKIE_KEY);
  });

  it("Can navigate to different login pages", () => {
    cy.visit("/");
    cy.findByRole("heading", { name: "Welcome to Open eBooks" }).should(
      "exist"
    );

    cy.log("home page has login buttons");
    cy.findByRole("link", { name: "Login with Clever" }).should("exist");
    cy.findByRole("link", { name: "Login with First Book" }).should("exist");

    cy.log("can click login button in the header");
    cy.findByRole("link", { name: "Log In" }).click();
    cy.location("pathname").should("eq", LOGIN_PATH);
    cy.get("Welcome to Open eBooks").should("not.exist");
    cy.findByRole("listitem", { name: "Current location: Login" }).should(
      "exist"
    );

    cy.log("clever and firstbook buttons exist on the login page");
    cy.findByRole("link", { name: "Login with Clever" }).should("exist");
    cy.findByRole("link", { name: "Login with First Book" })
      .should("exist")
      .click();

    cy.log("should be on firstbook credentials input page now");
    cy.location("pathname").should("contain", FIRSTBOOK_LOGIN_PATH);
    cy.findByRole("textbox", { name: "Access Code input" }).should("exist");
    cy.findByRole("button", { name: "Login" }).should("exist");

    cy.log("can navigate back to the login selection page");
    cy.findByRole("link", { name: "Use a different login method" })
      .should("exist")
      .click();
  });
});

describe("FirstBook login", () => {
  beforeEach(() => {
    cy.clearCookie(COOKIE_KEY);
  });

  it("Can login with FirstBook", () => {
    cy.intercept("GET", `${SERVER_URL}/groups`, {
      fixture: "open-ebooks/all-access/all-collections.html"
    }).as("allCollections");

    cy.visit("/");
    cy.findByRole("link", { name: "Login with First Book" }).click();
    cy.location("pathname").should("eq", FIRSTBOOK_LOGIN_PATH);

    cy.log("type username and password");
    cy.findByRole("textbox", { name: "Access Code input" }).type(
      Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_USERNAME"),
      { log: false }
    );
    cy.findByLabelText("PIN input").type(
      Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_PW"),
      { log: false }
    );
    cy.findByRole("button", { name: "Login" }).click();

    cy.wait("@allCollections");

    cy.log("wait for url to change after submitting credentials");
    cy.url().should("eq", `${Cypress.config().baseUrl}${APP_PATH}`);

    cy.log(
      "verify you are on the landing page and collection lanes are present"
    );
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
  });

  it("Redirects to collection page after login", () => {
    // FIXME: Redirect is not happening when first navigating to a collection and then logging in
    // cy.visit(ALL_ACCESS_AUTHOR_RECOMMENDATIONS_PATH_HUNTER_C_C);
  });

  it("Displays error when entering nothing", () => {
    cy.visit(FIRSTBOOK_LOGIN_PATH);
    cy.findByRole("button", { name: "Login" }).click();
    cy.findByText("Your PIN is required.").should("exist");
    cy.findByText("Your Access Code is required.").should("exist");
  });

  it("Displays error when entering only username", () => {
    cy.visit(FIRSTBOOK_LOGIN_PATH);
    cy.findByRole("textbox", { name: "Access Code input" }).type(
      Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_USERNAME"),
      { log: false }
    );
    cy.findByRole("button", { name: "Login" }).click();
    cy.findByText("Your PIN is required.").should("exist");
  });

  it("Displays error when entering only password", () => {
    cy.visit(FIRSTBOOK_LOGIN_PATH);
    cy.findByLabelText("PIN input").type(
      Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_PW"),
      { log: false }
    );
    cy.findByRole("button", { name: "Login" }).click();
    cy.findByText("Your Access Code is required.").should("exist");
  });

  it("Displays error when entering incorrect credentials", () => {
    cy.visit(FIRSTBOOK_LOGIN_PATH);
    cy.findByRole("textbox", { name: "Access Code input" }).type(
      Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_USERNAME"),
      { log: false }
    );
    cy.findByLabelText("PIN input").type("0987234", { log: false });

    cy.intercept("GET", `${SERVER_URL}/loans`, {
      statusCode: 401,
      fixture: "open-ebooks/incorrect-credentials.json"
    }).as("incorrectCredentials");

    cy.findByRole("button", { name: "Login" }).click();
    cy.wait("@incorrectCredentials")
      .its("response.statusCode")
      .should("eq", 401);
    cy.findByText(
      "Invalid credentials: A valid library card barcode number and PIN are required."
    ).should("exist");
  });
});
