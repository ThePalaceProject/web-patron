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

  it("can view books and collections for all access levels", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Verify all level lanes are present
    cy.findByRole("heading", { name: "High School collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Middle Grades collection" }).should(
      "exist"
    );
    cy.findByRole("heading", { name: "Early Grades collection" }).should(
      "exist"
    );

    // Verify you can visit all 3 lanes
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Middle Grades" }).should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Early Grades" }).should("exist");

    // Verify you can navigate to books and collections at any level
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Romance" }).should("exist");
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_HEART_OF_A_CHAMPION);
    cy.findByRole("heading", { name: "Heart of a Champion" }).should("exist");
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Comics" }).should("exist");
    cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    cy.findByRole("heading", {
      name: "Abby Carnelia's One and Only Magical Power"
    }).should("exist");
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Chapter Books" }).should("exist");
    cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    cy.findByRole("heading", { name: "All About Ellie" }).should("exist");
  });
});

describe("High school access", () => {
  beforeEach(() => {
    cy.loginByApi("HIGH_SCHOOL_USER");
  });

  it("can view books and collections for high school grades", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Veryify high school lane headings are present
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

    // Verify only High School "All access" lane is accessible via direct link
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByRole("heading", { name: "High School" }).should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");

    // Verify you can navigate to collections and books in your age class
    cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Romance" }).should("exist");
    cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    cy.findByRole("heading", { name: "Rush, Jennifer" }).should("exist");
    cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    cy.findByRole("heading", { name: "Altered" }).should("exist");

    // FIXME: Verify you cannot navigate to collections or books outside your age class
    // cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

describe("Middle grades access", () => {
  beforeEach(() => {
    cy.loginByApi("MIDDLE_GRADES_USER");
  });

  it("can view books and collections for middle grades", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Veryify middle grades lane headings are present
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

    // Verify only Middle Grades "All access" lane is accessible via direct link
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Middle Grades" }).should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");

    // Verify you can navigate to collections and books in your age class
    cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Comics" }).should("exist");
    cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    cy.findByRole("heading", {
      name: "Abby Carnelia's One and Only Magical Power"
    }).should("exist");
    cy.visit(MIDDLE_GRADES_STAFF_PICKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Staff Picks" }).should("exist");

    // FIXME: Verify you cannot navigate to collections or books outside your age class
    // cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

describe("Early grades access", () => {
  beforeEach(() => {
    cy.loginByApi("EARLY_GRADES_USER");
  });

  it("can view books and collections for early grades", () => {
    cy.visit(APP_PATH);

    // Verify collection title
    cy.findByRole("heading", { name: "Open eBooks (QA Server)" }).should(
      "exist"
    );

    // Veryify early grade collection lane headings are present
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

    // Verify only Early Grades "All access" lane is accessible via direct link
    cy.visit(HIGH_SCHOOL_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(MIDDLE_GRADES_COLLECTION_PATH);
    cy.findByText("404 Error: No such lane.").should("exist");
    cy.visit(EARLY_GRADES_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Early Grades" }).should("exist");

    // Verify you can navigate to collections and books in your age class
    cy.visit(EARLY_GRADES_CHAPTER_BOOKS_COLLECTION_PATH);
    cy.findByRole("heading", { name: "Chapter Books" }).should("exist");
    cy.visit(EARLY_GRADES_DETAIL_BOOK_PATH_ALL_ABOUT_ELLIE);
    cy.findByRole("heading", { name: "All About Ellie" }).should("exist");

    // FIXME: Verify you cannot navigate to collections or books outside your age class
    // cy.visit(HIGH_SCHOOL_AUTHOR_RECOMMENDATIONS_PATH_JENNIFER_RUSH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(HIGH_SCHOOL_ROMANCE_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(HIGH_SCHOOL_DETAIL_BOOK_PATH_ALTERED);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(MIDDLE_GRADES_COMICS_COLLECTION_PATH);
    // cy.findByText("404 Error: No such lane.").should("exist");
    // cy.visit(MIDDLE_GRADES_DETAIL_BOOK_PATH_ABBY_CARNELIA);
    // cy.findByText("404 Error: No such lane.").should("exist");
  });
});

export {};
