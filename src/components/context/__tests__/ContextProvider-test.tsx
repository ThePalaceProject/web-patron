import * as React from "react";
import { shallow } from "enzyme";

import AppContextProvider from "../ContextProvider";
import buildStore from "opds-web-client/lib/store";

class TestComponent extends React.Component<any, any> {}

describe("ContextProvider", () => {
  let wrapper;
  let store;
  const library = {
    id: "TEST",
    catalogUrl: "http://example.com/home",
    catalogName: "Example",
    libraryLinks: {}
  };

  beforeEach(() => {
    store = buildStore();
    wrapper = shallow(
      <AppContextProvider
        library={library}
        initialState={store.getState()}
        shortenUrls
      >
        <TestComponent />
      </AppContextProvider>
    );
  });

  test("provides child context", () => {
    const context = wrapper.instance().getChildContext();
    expect(context.pathFor).toBe(wrapper.instance().pathFor);
    expect(context.library).toBe(library);
    expect(context.initialState).toBe(store.getState());
  });

  test("renders child", () => {
    const children = wrapper.find(TestComponent);
    expect(children.length).toBe(1);
  });

  describe("pathFor", () => {
    const collectionUrl = "collection/url";
    const bookUrl = "book/url";
    const host = "http://example.com";

    beforeEach(() => {
      wrapper = shallow(
        <AppContextProvider
          library={library}
          shortenUrls={false}
          initialState={store.getState()}
        >
          <TestComponent />
        </AppContextProvider>
      );
    });

    test("returns a path with collection and book", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(collectionUrl, bookUrl);
      expect(path).toBe(
        `/TEST/collection/${instance.urlShortener.prepareCollectionUrl(
          collectionUrl
        )}` + `/book/${instance.urlShortener.prepareBookUrl(bookUrl)}`
      );
    });

    test("returns a path with only collection", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(collectionUrl, null);
      expect(path).toBe(
        `/TEST/collection/${instance.urlShortener.prepareCollectionUrl(
          collectionUrl
        )}`
      );
    });

    test("returns a path with only book", () => {
      const instance = wrapper.instance();
      const path = instance.pathFor(null, bookUrl);
      expect(path).toBe(
        `/TEST/book/${instance.urlShortener.prepareBookUrl(bookUrl)}`
      );
    });

    test("returns a path with no collection or book", () => {
      const path = wrapper.instance().pathFor(null, null);
      expect(path).toBe(`/TEST`);
    });

    test("returns a path with no collection or book and no library id", () => {
      const library = {
        id: null,
        catalogUrl: "http://example.com/home",
        catalogName: "Example"
      };
      expect(0).toBe(1);
      // this doesn't work. ContextProvider expects full LibraryData
      // wrapper = shallow(
      //   <AppContextProvider
      //     library={library}
      //     shortenUrls={false}
      //     initialState={store.getState()}
      //   >
      //     <TestComponent />
      //   </AppContextProvider>
      // );
      // const path = wrapper.instance().pathFor(null, null);
      // expect(path).to.equal(`/`);
    });
  });
});
