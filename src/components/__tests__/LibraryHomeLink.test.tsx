import * as React from "react";
import { render } from "test-utils";
import LibraryHomeLink from "../LibraryHomeLink";

describe("LibraryHomeLink", () => {
  describe("link text", () => {
    test("displays title when provided", () => {
      const utils = render(
        <LibraryHomeLink slug="my-library" title="My Public Library" />
      );

      const link = utils.getByRole("link");
      expect(link).toHaveTextContent("My Public Library");
      expect(link).not.toHaveTextContent("my-library");
    });

    test("displays slug when title is undefined", () => {
      const utils = render(<LibraryHomeLink slug="my-library" />);

      const link = utils.getByRole("link");
      expect(link).toHaveTextContent("my-library");
    });

    test("displays slug when title is empty string", () => {
      const utils = render(<LibraryHomeLink slug="my-library" title="" />);

      const link = utils.getByRole("link");
      expect(link).toHaveTextContent("my-library");
    });

    test("does not include leading slash in link text with title", () => {
      const utils = render(
        <LibraryHomeLink slug="my-library" title="My Library" />
      );

      const link = utils.getByRole("link");
      expect(link.textContent).toBe("My Library");
      expect(link.textContent).not.toMatch(/^\//);
    });

    test("does not include leading slash in link text with slug fallback", () => {
      const utils = render(<LibraryHomeLink slug="my-library" />);

      const link = utils.getByRole("link");
      expect(link.textContent).toBe("my-library");
      expect(link.textContent).not.toMatch(/^\//);
    });
  });

  describe("link href", () => {
    test("sets href to /{slug} when title is provided", () => {
      const utils = render(
        <LibraryHomeLink slug="test-lib" title="Test Library" />
      );

      const link = utils.getByRole("link");
      expect(link).toHaveAttribute("href", "/test-lib");
    });

    test("sets href to /{slug} when title is not provided", () => {
      const utils = render(<LibraryHomeLink slug="another-lib" />);

      const link = utils.getByRole("link");
      expect(link).toHaveAttribute("href", "/another-lib");
    });

    test("handles slugs with special characters", () => {
      const utils = render(
        <LibraryHomeLink slug="my-library-123" title="Library Name" />
      );

      const link = utils.getByRole("link");
      expect(link).toHaveAttribute("href", "/my-library-123");
    });
  });

  describe("rendering", () => {
    test("renders a single link element", () => {
      const utils = render(<LibraryHomeLink slug="lib" title="Library" />);

      const links = utils.getAllByRole("link");
      expect(links).toHaveLength(1);
    });

    test("can be found by link text when title is provided", () => {
      const utils = render(
        <LibraryHomeLink slug="lib" title="City Public Library" />
      );

      const link = utils.getByRole("link", { name: "City Public Library" });
      expect(link).toBeInTheDocument();
    });

    test("can be found by link text when using slug", () => {
      const utils = render(<LibraryHomeLink slug="city-library" />);

      const link = utils.getByRole("link", { name: "city-library" });
      expect(link).toBeInTheDocument();
    });
  });
});
