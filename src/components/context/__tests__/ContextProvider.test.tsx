import * as React from "react";
import { shallow } from "enzyme";
import { renderHook } from "@testing-library/react-hooks";
import AppContextProvider from "../ContextProvider";
import { LibraryData } from "../../../interfaces";
import { State } from "owc/state";
import useLibraryContext from "../LibraryContext";
import { MockNextRouterContextProvider } from "../../../test-utils/mockNextRouter";
import { usePathFor } from "owc/PathForContext";
import * as modal from "components/Modal";

// react portals not supported by hooks testing library
const mockModal = jest.spyOn(modal, "default");
mockModal.mockReturnValue(<div>modal</div>);

const TestComponent: React.FC = () => <div>test child</div>;

const testLibrary: LibraryData = {
  slug: "TEST",
  catalogUrl: "http://example.com/home",
  catalogName: "Example",
  libraryLinks: {},
  logoUrl: null,
  colors: null,
  headerLinks: [],
  authMethods: [],
  shelfUrl: "/shelf",
  searchData: null
};

type MakeContextConfig = {
  library?: LibraryData;
  initialState?: State;
  shortenUrls?: boolean;
};

// eslint-disable-next-line react/display-name
const makeContextWrapper = (config: MakeContextConfig = {}) => ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { library = testLibrary } = config;
  return (
    <MockNextRouterContextProvider>
      <AppContextProvider library={library}>{children}</AppContextProvider>
    </MockNextRouterContextProvider>
  );
};

describe("ContextProvider", () => {
  test("provides library in context", () => {
    const { result } = renderHook(() => useLibraryContext(), {
      wrapper: makeContextWrapper()
    });
    expect(result.current).toEqual(testLibrary);
  });

  test("renders child", () => {
    const wrapper = shallow(
      <AppContextProvider library={testLibrary}>
        <TestComponent />
      </AppContextProvider>
    );
    const children = wrapper.find(TestComponent);
    expect(children.length).toBe(1);
  });

  describe("pathFor", () => {
    const collectionUrl = "collection/url";
    const bookUrl = "book/url";

    test("returns a path with collection and book", () => {
      const { result } = renderHook(() => usePathFor(), {
        wrapper: makeContextWrapper()
      });
      const path = result.current(collectionUrl, bookUrl);
      expect(path).toMatchInlineSnapshot(
        `"/TEST/collection/collection%2Furl/book/book%2Furl"`
      );
    });

    test("returns a path with only collection", () => {
      const { result } = renderHook(() => usePathFor(), {
        wrapper: makeContextWrapper()
      });
      const path = result.current(collectionUrl, null);
      expect(path).toMatchInlineSnapshot(`"/TEST/collection/collection%2Furl"`);
    });

    test("returns a path with only book", () => {
      const { result } = renderHook(() => usePathFor(), {
        wrapper: makeContextWrapper()
      });
      const path = result.current(null, bookUrl);
      expect(path).toMatchInlineSnapshot(`"/TEST/book/book%2Furl"`);
    });

    test("returns a path with no collection or book", () => {
      const { result } = renderHook(() => usePathFor(), {
        wrapper: makeContextWrapper()
      });
      const path = result.current(null, null);
      expect(path).toMatchInlineSnapshot(`"/TEST"`);
    });

    test("returns a path with no collection or book and no library id", () => {
      const libraryWithoutId: LibraryData = {
        libraryLinks: {},
        catalogUrl: "http://example.com/home",
        catalogName: "Example",
        slug: null,
        logoUrl: null,
        colors: null,
        headerLinks: [],
        authMethods: [],
        shelfUrl: "/shelf",
        searchData: null
      };
      const { result } = renderHook(() => usePathFor(), {
        wrapper: makeContextWrapper({ library: libraryWithoutId })
      });
      const path = result.current(null, null);
      expect(path).toBe("/");
    });
  });
});
