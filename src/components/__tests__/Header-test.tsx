import { spy } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import Header from "../Header";
import { Navbar } from "react-bootstrap";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

describe("Header", () => {
  let context, wrapper;
  let fetchLoans, clearAuthCredentials;
  let push, pathFor;

  beforeEach(() => {
    fetchLoans = spy();
    clearAuthCredentials = spy();
    push = spy();
    pathFor = spy((collection, book) => "collection" + "::" + "book");
    context = {
      library: {
        id: "uuid",
        catalogUrl: "home url",
        catalogName: "catalog name",
        headerLinks: [
          { title: "link 1", href: "http://link1" },
          { title: "link 2", href: "http://link2" }
        ],
        logoUrl: "logo.png"
      },
      router: { push },
      pathFor
    };
    wrapper = shallow(
      <Header
      // collectionTitle="collection"
      // bookTitle="book"
      // loansUrl="loans url"
      // isSignedIn={false}
      // fetchLoans={fetchLoans}
      // clearAuthCredentials={clearAuthCredentials}
      />,
      { context }
    );
  });

  describe("rendering", () => {
    test("displays library name", () => {
      const brand = wrapper.find(Navbar.Brand);
      expect(brand.containsMatchingElement(context.library.catalogName)).toBe(
        true
      );
    });

    test("adds class if there's a logo", () => {
      const brand = wrapper.find(Navbar.Brand);
      expect(brand.props().className).toEqual(
        expect.arrayContaining(["with-logo"])
      );
    });

    test("displays link to catalog", () => {
      const link = wrapper
        .find(CatalogLink)
        .filterWhere(link => link.children().text() === "Catalog");
      expect(link.prop("collectionUrl")).toBe("home url");
    });

    test("displays link to loans when currently signed in", () => {
      wrapper.setProps({ isSignedIn: true });
      const link = wrapper
        .find(CatalogLink)
        .filterWhere(link => link.children().text() === "My Books");
      expect(link.prop("collectionUrl")).toBe("loans url");
    });

    test("hides link to loans when signed out", () => {
      const link = wrapper
        .find(CatalogLink)
        .filterWhere(link => link.children().text() === "My Books");
      expect(link.length).toBe(0);
    });

    test("displays link to sign in if not currently signed in", () => {
      const link = wrapper
        .find("a")
        .filterWhere(link => link.text() === "Sign In");
      expect(link.prop("onClick")).toBe(wrapper.instance().signIn);
    });

    test("displays link to sign out if currently signed in", () => {
      wrapper.setProps({ isSignedIn: true });
      const link = wrapper
        .find("a")
        .filterWhere(link => link.text() === "Sign Out");
      expect(link.text()).toBe("Sign Out");
      expect(link.prop("onClick")).toBe(wrapper.instance().signOut);
    });

    test("displays header links from context", () => {
      const link1 = wrapper
        .find("a")
        .filterWhere(link => link.text() === "link 1");
      expect(link1.props().href).toBe("http://link1");
      const link2 = wrapper
        .find("a")
        .filterWhere(link => link.text() === "link 2");
      expect(link2.props().href).toBe("http://link2");
    });
  });

  describe("behavior", () => {
    test("fetches loans when sign in link is clicked", () => {
      const link = wrapper
        .find("a")
        .filterWhere(link => link.text() === "Sign In");
      link.simulate("click");
      expect(fetchLoans.callCount).toBe(1);
      expect(fetchLoans.args[0][0]).toBe("loans url");
    });

    test("clears auth credentials and loads catalog when sign out link is clicked", () => {
      wrapper.setProps({ isSignedIn: true });
      const link = wrapper
        .find("a")
        .filterWhere(link => link.text() === "Sign Out");
      link.simulate("click");
      expect(clearAuthCredentials.called).toBe(true);
      expect(pathFor.args[0][0]).toBe("home url");
      expect(pathFor.args[0][1]).toBe(null);
      expect(push.args[0]).toEqual([pathFor("home url", null)]);
    });
  });
});
