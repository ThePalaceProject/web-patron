import {
  APP_PATH,
  SERVER_URL,
  CLEVER_LOGIN_PATH,
  COOKIE_KEY,
  FIRSTBOOK_LOGIN_PATH,
  LOGIN_PATH
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
    cy.intercept("GET", `${SERVER_URL}/groups`).as("allCollections");
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

    cy.log("wait for url to change after submitting credentials");
    cy.wait("@allCollections");
    cy.url().should("eq", `${Cypress.config().baseUrl}${APP_PATH}`);
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
    // cy.findByRole("link", { name: "Sign In" }).click();
    // cy.findByRole("link", { name: "Login with First Book" }).click();
    // cy.log("type username and password");
    // cy.findByRole("textbox", { name: "Access Code input" }).type(
    //   Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_USERNAME"),
    //   { log: false }
    // );
    // cy.findByLabelText("PIN input").type(
    //   Cypress.env("OPENEBOOKS_ALL_ACCESS_USER_PW"),
    //   { log: false }
    // );
    // cy.findByRole("button", { name: "Login" }).click();
    // cy.findByRole("heading", { name: "Hunter, C. C." }).should("exist");
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
    cy.findByLabelText("PIN input").type("1234", { log: false });
    cy.findByRole("button", { name: "Login" }).click();
    cy.findByText(
      "Invalid credentials: A valid library card barcode number and PIN are required."
    ).should("exist");
  });

  it("Can logout with FirstBook", () => {
    cy.intercept("GET", `${SERVER_URL}/groups`).as("allCollections");
    cy.intercept("GET", `${SERVER_URL}/loans`).as("loans");
    cy.loginByApi("ALL_ACCESS_USER");
    cy.visit(APP_PATH);
    cy.wait("@allCollections");
    cy.findByRole("button", { name: "Sign Out" }).should("exist").click();
    cy.findByRole("button", { name: "Cancel" }).should("exist");
    cy.findByRole("button", { name: "Confirm Sign Out" })
      .should("exist")
      .click();
    cy.wait("@loans");
    cy.location("pathname").should("eq", LOGIN_PATH);
    cy.findByRole("listitem", { name: "Current location: Login" }).should(
      "exist"
    );
  });
});

describe("Clever login", () => {
  beforeEach(() => {
    cy.clearCookie(COOKIE_KEY);
  });

  it("Redirects to Clever login", () => {
    cy.visit("/");
    cy.findByRole("link", { name: "Login with Clever" }).should(
      "have.attr",
      "href",
      CLEVER_LOGIN_PATH
    );

    cy.findByRole("link", { name: "Login with Clever" }).should("exist");
  });

  it("Correct Clever token is handled", () => {
    cy.visit(
      `${APP_PATH}#access_token=${Cypress.env(
        "OPENEBOOKS_CLEVER_HIGH_SCHOOL_ACCESS_TOKEN"
      )}`
    );

    cy.log(
      "Clever auth token is cleared & high school home page collection properly loads"
    );
    cy.location("pathname").should("eq", APP_PATH);
    cy.findByRole("heading", { name: "Open eBooks (QA Server) Home" }).should(
      "exist"
    );
    cy.findByRole("listitem", { name: "Current location: High School" }).should(
      "exist"
    );
  });

  it("Incorrect Clever token displays error", () => {
    const cleverErrorMessage = "Clever login error";
    cy.visit(`${APP_PATH}?loginError=${cleverErrorMessage}`);
    cy.location("pathname").should("eq", LOGIN_PATH);
    cy.findByText(cleverErrorMessage).should("exist");
  });
});
