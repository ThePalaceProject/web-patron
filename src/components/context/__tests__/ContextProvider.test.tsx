import { describe, expect, jest, test } from "@jest/globals";
import * as React from "react";
import { renderHook } from "@testing-library/react";
import AppContextProvider from "../ContextProvider";
import { LibraryData } from "interfaces";
import useLibraryContext from "../LibraryContext";
import { MockNextRouterContextProvider } from "test-utils/mockNextRouter";
import * as modal from "components/Modal";

// react portals not supported by hooks testing library
const mockModal = jest.spyOn(modal, "default");
mockModal.mockReturnValue(<div>modal</div>);

// const TestComponent: React.FC = () => <div>test child</div>;

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
  userProfileUrl: null
};

type MakeContextConfig = {
  library?: LibraryData;
  shortenUrls?: boolean;
};

const makeContextWrapper =
  (config: MakeContextConfig = {}) =>
  ({ children }: { children: React.ReactNode }) => {
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

  // [TODO] update any tests that use enzyme, i.e. shallow()
  // test("renders child", () => {
  //   const wrapper = shallow(
  //     <AppContextProvider library={testLibrary}>
  //       <TestComponent />
  //     </AppContextProvider>
  //   );
  //   const children = wrapper.find(TestComponent);
  //   expect(children.length).toBe(1);
  // });
});
