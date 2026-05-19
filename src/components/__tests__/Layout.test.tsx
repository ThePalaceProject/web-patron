import * as React from "react";
import { screen, setup } from "../../test-utils";
import { mockPush } from "test-utils/mockNextRouter";
import Layout from "../Layout";

describe("Layout nav + structure", () => {
  describe("Navbar", () => {
    test("Library icon button navigates to web catalog home", async () => {
      const { user } = setup(<Layout>Child</Layout>);
      const libraryIconButton = screen.getByLabelText(
        "Go to catalog home page"
      );

      // the home button should navigate to the catalog home page ("/testlib") for t
      expect(libraryIconButton.closest("a")).toHaveAttribute(
        "href",
        "/testlib"
      );
      await user.click(libraryIconButton);
      expect(mockPush).toHaveBeenCalledWith(
        "/testlib",
        "/testlib",
        expect.objectContaining({
          scroll: true,
          shallow: true,
          locale: undefined
        })
      );
    });

    test("Catalog nav button navigates to web catalog home", async () => {
      const { user } = setup(<Layout>Child</Layout>);
      const catalogButton = screen.getByRole("link", { name: "Catalog" });
      expect(catalogButton).toHaveAttribute("href", "/testlib");
      await user.click(catalogButton);
      expect(mockPush).toHaveBeenCalledWith(
        "/testlib",
        "/testlib",
        expect.objectContaining({
          scroll: true,
          shallow: true,
          locale: undefined
        })
      );
    });

    test("my books navigates to /loans", () => {
      setup(<Layout>Child</Layout>);
      const myBooks = screen.getAllByRole("link", { name: "My Books" });
      myBooks.forEach(ln =>
        expect(ln).toHaveAttribute("href", "/testlib/loans")
      );
    });
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
