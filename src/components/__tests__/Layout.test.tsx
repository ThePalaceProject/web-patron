import * as React from "react";
import { screen, setup } from "../../test-utils";
import Layout from "../Layout";

describe("Layout nav + structure", () => {
  test("Library icon button navigates home", () => {
    setup(<Layout>Child</Layout>);
    const homeButton = screen.getByLabelText(
      "Library catalog, back to homepage"
    );

    // the home button should navigate to "/"
    expect(homeButton.closest("a")).toHaveAttribute("href", "/testlib");
  });

  test("my books navigates to /loans", () => {
    setup(<Layout>Child</Layout>);
    const myBooks = screen.getAllByRole("link", { name: "My Books" });
    myBooks.forEach(ln => expect(ln).toHaveAttribute("href", "/testlib/loans"));
  });

  test("displays children within main", () => {
    setup(<Layout>Some children</Layout>);
    const main = screen.getByRole("main");
    expect(main).toHaveTextContent("Some children");
  });

  test("provides a working skip nav link", async () => {
    const { user } = setup(<Layout>Child</Layout>);
    const skipNav = screen.getByText("Skip to content").closest("a");
    const main = screen.getByRole("main");

    await user.tab();
    expect(skipNav).toHaveFocus();
    /**
     * All we can do with jsdom is make sure that the id of main matches the href of skip navigation
     */
    expect(skipNav).toHaveAttribute("href", `#${main.id}`);
  });

  test("provides global styles", () => {
    setup(<Layout>Some children</Layout>);
    expect(document.body).toHaveStyle("margin: 0;");
  });
});
