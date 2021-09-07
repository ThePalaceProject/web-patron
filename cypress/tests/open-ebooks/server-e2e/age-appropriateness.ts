/// <reference types="cypress" />

import {
  APP_PATH,
  EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH,
  EARLY_GRADES_COLLECTION_PATH,
  EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE,
  HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH,
  HIGH_SCHOOL_COLLECTION_PATH,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION,
  HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED,
  HIGH_SCHOOL_ROMANCE_COLLECTION_PATH,
  MIDDLE_GRADES_COLLECTION_PATH,
  MIDDLE_GRADES_COMICS_COLLECTION_PATH,
  MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA,
  MIDDLE_GRADES_STAFF_PICKS_COLLECTION_PATH
} from "../../../support/utils";

describe("All access", () => {
  beforeEach(() => {
    cy.loginByApi("ALL_ACCESS_USER");
  });

  it("Landing page displays all 3 access lanes", () => {
    cy.visit(APP_PATH);

    cy.log("verify collection title");
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");

    cy.log("verify all level lanes are present");
    cy.findByRole("heading", {
      name: "Books for integration testing collection"
    }).should("exist");
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "exist"
    );
  });

  it("Can navigate directly to all 3 access lanes", () => {
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Middle Grades" }).should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Early Grades" }).should("exist");
  });

  it("Can navigate directly to collections at any level", () => {
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Romance" }).should("exist");
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Comics" }).should("exist");
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Chapter Books" }).should("exist");
  });

  it("Can navigate directly to books at any level", () => {
    cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    cy.findByRole("heading", { name: "All About Ellie" }).should("exist");
    cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    cy.findByRole("heading", {
      name: "Abby Carnelia's One and Only Magical Power"
    }).should("exist");
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION);
    cy.findByRole("heading", { name: "Heart of a Champion" }).should("exist");
  });
});

describe("High school access", () => {
  beforeEach(() => {
    cy.loginByApi("HIGH_SCHOOL_USER");
  });

  it("Landing page displays only high school content", () => {
    cy.visit(APP_PATH);

    cy.log("verify collection title");
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");

    cy.findByRole("listitem", { name: "Current location: High School" }).should(
      "exist"
    );

    cy.log(
      "verify 'all access' lanes are not present -- these should only exist when logging in as an All Access user type"
    );
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    cy.log("verify high school lane headings are present");
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
  });

  it("Can navigate directly to collections inside their age class", () => {
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Romance" }).should("exist");
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
  });

  it("Can navigate directly to books inside their age class", () => {
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    cy.findByRole("heading", { name: "Altered" }).should("exist");
  });

  it("Blocks users from navigating to collections outside their age class", () => {
    // FIXME: Occasionally, these tests fail when they shouldn't! https://jira.nypl.org/browse/SFR-1272
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
  });

  it("Blocks users from navigating to books outside their age class", () => {
    // FIXME: This is a bug that needs to be fixed in order to get these tests to pass https://jira.nypl.org/browse/SFR-1268
    // cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

describe("Middle grades access", () => {
  beforeEach(() => {
    cy.loginByApi("MIDDLE_GRADES_USER");
  });

  it("Landing page displays only middle grades content", () => {
    cy.visit(APP_PATH);

    cy.log("verify collection title");
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");
    cy.findByRole("listitem", {
      name: "Current location: Middle Grades"
    }).should("exist");

    cy.log(
      "verify 'all access' lanes are not present -- these should only exist when logging in as an All Access user type"
    );
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    cy.log("verify middle grades lane headings are present");
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
  });

  it("Can navigate directly to collections inside their age class", () => {
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Middle Grades" }).should("exist");
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Comics" }).should("exist");
    cy.visit(MIDDLE_GRADES_STAFF_PICKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");
  });

  it("Can navigate directly to books inside their age class", () => {
    cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    cy.findByRole("heading", {
      name: "Abby Carnelia's One and Only Magical Power"
    }).should("exist");
  });

  it("Blocks users from navigating to collections outside their age class", () => {
    // FIXME: Occasionally, these tests fail when they shouldn't! https://jira.nypl.org/browse/SFR-1272
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
  });

  it("Blocks users from navigating to books outside their age class", () => {
    // FIXME: This is a bug that needs to be fixed in order to get these tests to pass https://jira.nypl.org/browse/SFR-1268
    // cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

describe("Early grades access", () => {
  beforeEach(() => {
    cy.loginByApi("EARLY_GRADES_USER");
  });

  it("Landing page displays only early grades content", () => {
    cy.visit(APP_PATH);

    cy.log("verify collection title");
    cy.get("main")
      .findByRole("heading", { name: "Open eBooks (QA Server) Home" })
      .should("exist");
    cy.findByRole("listitem", {
      name: "Current location: Early Grades"
    }).should("exist");

    cy.log(
      "verify 'all access'lanes are not present -- these should only exist when logging in as an All Access user type"
    );
    cy.findByRole("heading", { name: "High School collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "not.exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "not.exist"
    );

    cy.log("verify early grade collection lane headings are present");
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
  });

  it("Can navigate directly to collections inside their age class", () => {
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Early Grades" }).should("exist");
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Chapter Books" }).should("exist");
  });

  it("Can navigate directly to books inside their age class", () => {
    cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    cy.findByRole("heading", { name: "All About Ellie" }).should("exist");
  });

  it("Blocks users from navigating to collections outside their age class", () => {
    // FIXME: Occasionally, these tests fail when they shouldn't! https://jira.nypl.org/browse/SFR-1272
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
  });

  it("Blocks users from navigating to books outside their age class", () => {
    // FIXME: This is a bug that needs to be fixed in order to get these tests to pass https://jira.nypl.org/browse/SFR-1268
    // cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

export {};
