import * as React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";

import ContextProvider from "../ContextProvider";

class TestComponent extends React.Component<any, any> {}

describe("ContextProvider", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <ContextProvider
        homeUrl="http://example.com/home"
        catalogBase="http://example.com">
        <TestComponent />
      </ContextProvider>
    );
  });

  it("provides child context", () => {
    let context = wrapper.instance().getChildContext();
    expect(context.pathFor).to.equal(wrapper.instance().pathFor);
    expect(context.homeUrl).to.equal("home url");
  });

  it("renders child", () => {
    let children = wrapper.find(TestComponent);
    expect(children.length).to.equal(1);
  });

  describe("pathFor", () => {
    let collectionUrl = "collection/url";
    let bookUrl = "book/url";
    let tab = "tab";
    let host = "http://example.com";

    it("prepares collection url", () => {
      let url = host + "/groups/eng/Adult%20Fiction";
      expect(wrapper.instance().prepareCollectionUrl(url)).to.equal("groups%2Feng%2FAdult%2520Fiction");
    });

    it("prepares book url", () => {
      let url = host + "/works/Axis%20360/Axis%20360%20ID/0016201449";
      expect(wrapper.instance().prepareBookUrl(url)).to.equal("Axis%2520360%2FAxis%2520360%2520ID%2F0016201449");
    });

    it("returns a path with collection, book, and tab", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, bookUrl, tab);
      expect(path).to.equal(
        `/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
        `/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`
      );
    });

    it("returns a path with collection and book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, bookUrl, null);
      expect(path).to.equal(
        `/web/collection/${instance.prepareCollectionUrl(collectionUrl)}` +
        `/book/${instance.prepareBookUrl(bookUrl)}`
      );
    });

    it("returns a path with only collection", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(collectionUrl, null, null);
      expect(path).to.equal(`/web/collection/${instance.prepareCollectionUrl(collectionUrl)}`);
    });

    it("returns a path with only book", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(null, bookUrl, null);
      expect(path).to.equal(`/web/book/${instance.prepareBookUrl(bookUrl)}`);
    });

    it("returns a path with book and tab", () => {
      let instance = wrapper.instance();
      let path = instance.pathFor(null, bookUrl, tab);
      expect(path).to.equal(`/web/book/${instance.prepareBookUrl(bookUrl)}/tab/${tab}`);
    });

    it("returns a path with no collection, book, or tab", () => {
      let path = wrapper.instance().pathFor(null, null, null);
      expect(path).to.equal(`/web`);
    });
  });
});