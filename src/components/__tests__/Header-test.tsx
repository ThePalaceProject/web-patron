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
  let showBasicAuthForm, clearBasicAuthCredentials;
  let push, pathFor;

  beforeEach(() => {
    showBasicAuthForm = spy();
    clearBasicAuthCredentials = spy();
    push = spy();
    pathFor = spy((collection, book) => "collection" + "::" + "book");
    context = {
      homeUrl: "home url",
      catalogBase: "base",
      catalogName: "catalog name",
      logo: "logo",
      router: { push },
      pathFor
    };
    wrapper = shallow(
      <Header
        collectionTitle="collection"
        bookTitle="book"
        loansUrl="loans url"
        isSignedIn={false}
        showBasicAuthForm={showBasicAuthForm}
        clearBasicAuthCredentials={clearBasicAuthCredentials}
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
    });

    it("displays link to catalog", () => {
      let link = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "Catalog");
      expect(link.prop("collectionUrl")).to.equal("home url");
    });

    it("displays link to loans", () => {
      let link = wrapper.find(CatalogLink).filterWhere(link => link.children().text() === "Loans");
      expect(link.prop("collectionUrl")).to.equal("loans url");
    });

    it("displays link to sign in if not currently signed in", () => {
      let link = wrapper.find("a");
      expect(link.text()).to.equal("Sign In");
      expect(link.prop("onClick")).to.equal(wrapper.instance().signIn);
    });

    it("displays link to sign out if currently signed in", () => {
      wrapper.setProps({ isSignedIn: true });
      let link = wrapper.find("a");
      expect(link.text()).to.equal("Sign Out");
      expect(link.prop("onClick")).to.equal(wrapper.instance().signOut);
    });

    it("shows a search component", () => {
      let search = wrapper.find(TestSearch);
      expect(search).to.be.ok;
    });
  });

  describe("behavior", () => {
    it("shows basic auth form when sign in link is clicked", () => {
      let link = wrapper.find("a");
      link.simulate("click");
      expect(showBasicAuthForm.args[0][1]).to.deep.equal({ login: "Barcode", password: "PIN" });
      expect(showBasicAuthForm.args[0][2]).to.equal("Library");
    });

    it("clears basic auth credentials and loads catalog when sign out link is clicked", () => {
      wrapper.setProps({ isSignedIn: true });
      let link = wrapper.find("a");
      link.simulate("click");
      expect(clearBasicAuthCredentials.called).to.equal(true);
      expect(pathFor.args[0][0]).to.equal("home url");
      expect(pathFor.args[0][1]).to.equal(null);
      expect(push.args[0]).to.deep.equal([pathFor("home url", null)]);
    });
  });
});