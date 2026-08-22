import { jest } from "@jest/globals";
import * as React from "react";
import { act, fireEvent, render } from "test-utils";
import LibraryHomeLink, {
  FOCUS_PREFETCH_DEBOUNCE_MS
} from "../LibraryHomeLink";

/*
 * prefetch={false} leaves no trace in the DOM, and next/link skips its viewport
 * prefetch outside a production build, so the prop can only be read from what
 * LibraryHomeLink hands to next/link. The stand-in records those props and
 * then defers to the real next/link, so every other test still covers it.
 */
const mockLinkProps: Record<string, unknown>[] = [];

jest.mock("next/link", () => {
  const ActualLink = jest.requireActual<{
    default: React.ComponentType<any>;
  }>("next/link").default;
  return {
    __esModule: true,
    default: ({ children, ...props }: React.PropsWithChildren<any>) => {
      mockLinkProps.push(props);
      return <ActualLink {...props}>{children}</ActualLink>;
    }
  };
});

describe("LibraryHomeLink", () => {
  beforeEach(() => {
    mockLinkProps.length = 0;
  });

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

  describe("viewport prefetching", () => {
    test("turns off next/link's viewport prefetch", () => {
      render(<LibraryHomeLink slug="my-library" title="My Library" />);

      expect(mockLinkProps).toHaveLength(1);
      expect(mockLinkProps[0]).toMatchObject({
        href: "/my-library",
        prefetch: false
      });
    });

    test("turns off the viewport prefetch when no title is given", () => {
      render(<LibraryHomeLink slug="another-library" />);

      expect(mockLinkProps[0]).toMatchObject({ prefetch: false });
    });
  });

  describe("focus prefetching", () => {
    const mockPrefetch = () =>
      jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

    const settle = (ms: number) => act(() => jest.advanceTimersByTime(ms));

    test("prefetches the library page once focus settles", () => {
      const prefetch = mockPrefetch();
      const utils = render(<LibraryHomeLink slug="focus-lib" />, {
        router: { prefetch }
      });

      fireEvent.focus(utils.getByRole("link"));
      settle(FOCUS_PREFETCH_DEBOUNCE_MS);

      expect(prefetch).toHaveBeenCalledWith("/focus-lib");
    });

    test("does not prefetch while focus is still settling", () => {
      const prefetch = mockPrefetch();
      const utils = render(<LibraryHomeLink slug="focus-lib" />, {
        router: { prefetch }
      });

      fireEvent.focus(utils.getByRole("link"));
      settle(FOCUS_PREFETCH_DEBOUNCE_MS - 1);

      expect(prefetch).not.toHaveBeenCalled();
    });

    test("does not prefetch a link tabbed past", () => {
      const prefetch = mockPrefetch();
      const utils = render(<LibraryHomeLink slug="focus-lib" />, {
        router: { prefetch }
      });

      const link = utils.getByRole("link");
      fireEvent.focus(link);
      settle(50);
      fireEvent.blur(link);
      settle(FOCUS_PREFETCH_DEBOUNCE_MS);

      expect(prefetch).not.toHaveBeenCalled();
    });

    test("does not prefetch before the link receives focus", () => {
      const prefetch = mockPrefetch();
      render(<LibraryHomeLink slug="focus-lib" />, { router: { prefetch } });
      settle(FOCUS_PREFETCH_DEBOUNCE_MS);

      expect(prefetch).not.toHaveBeenCalled();
    });

    test("restarts the wait when focus re-enters the same link", () => {
      const prefetch = mockPrefetch();
      const utils = render(<LibraryHomeLink slug="focus-lib" />, {
        router: { prefetch }
      });

      const link = utils.getByRole("link");
      fireEvent.focus(link);
      settle(FOCUS_PREFETCH_DEBOUNCE_MS - 100);
      fireEvent.focus(link);
      settle(FOCUS_PREFETCH_DEBOUNCE_MS - 100);
      fireEvent.blur(link);
      settle(FOCUS_PREFETCH_DEBOUNCE_MS);

      expect(prefetch).not.toHaveBeenCalled();
    });

    test("prefetches even when the router rejects", () => {
      const prefetch = jest
        .fn<() => Promise<void>>()
        .mockRejectedValue(new Error("network down"));
      const utils = render(<LibraryHomeLink slug="focus-lib" />, {
        router: { prefetch }
      });

      fireEvent.focus(utils.getByRole("link"));
      settle(FOCUS_PREFETCH_DEBOUNCE_MS);

      expect(prefetch).toHaveBeenCalledWith("/focus-lib");
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
