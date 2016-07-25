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

  beforeEach(() => {
    context = { homeUrl: "home url" };
    showBasicAuthForm = spy();
    clearBasicAuthCredentials = spy();
    wrapper = shallow(
      <Header
        collectionTitle="collection"
        bookTitle="book"
        isSignedIn={false}
        showBasicAuthForm={showBasicAuthForm}
        clearBasicAuthCredentials={clearBasicAuthCredentials}
        >
        <TestSearch />
      </Header>,
      { context }
    );
  });

  it("displays logo", () => {
    let logo = wrapper.find(Navbar.Brand).find("img");
    expect(logo.length).to.equal(1);
  });

  it("displays library name", () => {
    let brand = wrapper.find(Navbar.Brand);
    expect(brand.containsMatchingElement("NYPL")).to.be.true;
  });

  it("displays link to catalog", () => {
    let link = wrapper.find(CatalogLink);
    expect(link.prop("collectionUrl")).to.equal("home url");
    expect(link.children().text()).to.equal("eBooks");
  });

  it("shows a search component", () => {
    let search = wrapper.find(TestSearch);
    expect(search).to.be.ok;
  });
});