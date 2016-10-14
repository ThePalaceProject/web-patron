import { expect } from "chai";
import { spy } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import Header from "../Header";
import { Navbar } from "react-bootstrap";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

class TestSearch extends React.Component<any, any> {
  render(): JSX.Element {
    return (
      <div className="test-search">collection</div>
    );
  }
}

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
      homeUrl: "home url",
      catalogBase: "base",
      catalogName: "catalog name",
      headerLinks: [
        { title: "link 1", url: "http://link1" },
        { title: "link 2", url: "http://link2" }
      ],
      logoLink: "home",
      router: { push },
      pathFor
    };
    wrapper = shallow(
      <Header
        collectionTitle="collection"
        bookTitle="book"
        loansUrl="loans url"
        isSignedIn={false}
        fetchLoans={fetchLoans}
        clearAuthCredentials={clearAuthCredentials}
        >
        <TestSearch />
      </Header>,
      { context }
    );
  });

  describe("rendering", ( ) => {
    it("displays library name", () => {
      let brand = wrapper.find(Navbar.Brand);
      expect(brand.containsMatchingElement(context.catalogName)).to.be.true;
      let link = brand.find("a");
      expect(link.props().href).to.equal("home");
    });

    it("displays link to catalog", () => {
      let link = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "Catalog");
      expect(link.prop("collectionUrl")).to.equal("home url");
    });

    it("displays link to loans when currently signed in", () => {
      wrapper.setProps({ isSignedIn: true });
      let link = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "My Books");
      expect(link.prop("collectionUrl")).to.equal("loans url");
    });

    it("hides link to loans when signed out", () => {
      let link = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "My Books");
      expect(link.length).to.equal(0);
    });

    it("displays link to sign in if not currently signed in", () => {
      let link = wrapper.find("a").filterWhere(link => link.text() === "Sign In");
      expect(link.prop("onClick")).to.equal(wrapper.instance().signIn);
    });

    it("displays link to sign out if currently signed in", () => {
      wrapper.setProps({ isSignedIn: true });
      let link = wrapper.find("a").filterWhere(link => link.text() === "Sign Out");
      expect(link.text()).to.equal("Sign Out");
      expect(link.prop("onClick")).to.equal(wrapper.instance().signOut);
    });

    it("shows a search component", () => {
      let search = wrapper.find(TestSearch);
      expect(search).to.be.ok;
    });

    it("displays header links from context", () => {
      let link1 = wrapper.find("a").filterWhere(link => link.text() === "link 1");
      expect(link1.props().href).to.equal("http://link1");
      let link2 = wrapper.find("a").filterWhere(link => link.text() === "link 2");
      expect(link2.props().href).to.equal("http://link2");
    });
  });

  describe("behavior", () => {
    it("fetches loans when sign in link is clicked", () => {
      let link = wrapper.find("a").filterWhere(link => link.text() === "Sign In");
      link.simulate("click");
      expect(fetchLoans.callCount).to.equal(1);
      expect(fetchLoans.args[0][0]).to.equal("loans url");
    });

    it("clears auth credentials and loads catalog when sign out link is clicked", () => {
      wrapper.setProps({ isSignedIn: true });
      let link = wrapper.find("a").filterWhere(link => link.text() === "Sign Out");
      link.simulate("click");
      expect(clearAuthCredentials.called).to.equal(true);
      expect(pathFor.args[0][0]).to.equal("home url");
      expect(pathFor.args[0][1]).to.equal(null);
      expect(push.args[0]).to.deep.equal([pathFor("home url", null)]);
    });
  });
});