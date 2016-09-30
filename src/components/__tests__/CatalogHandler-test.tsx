import * as React from "react";
import { expect } from "chai";
import { shallow } from "enzyme";

import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";
import buildStore from "opds-web-client/lib/store";

describe("CatalogHandler", () => {
  let wrapper;
  let store;
  let params;
  let context;
  let child;
  let host = "http://example.com";
  let name = "Example";
  let authPlugins = [{
    type: "test",
    lookForCredentials: () => {},
    formComponent: null,
    buttonComponent: null
  }];

  beforeEach(() => {
    store = buildStore();
    params = {
      collectionUrl: "collectionurl",
      bookUrl: "bookurl",
      tab: "tab"
    };
    context = {
      homeUrl: host + "/home",
      catalogBase: host,
      catalogName: name,
      authPlugins: authPlugins,
      initialState: store.getState()
    };
    wrapper = shallow(
      <CatalogHandler
        params={params}
        />,
      { context }
    );
  });

  it("renders OPDSCatalog", () => {
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(host + "/collectionurl");
    expect(catalog.prop("bookUrl")).to.equal(host + "/works/bookurl");
    expect(catalog.prop("Header").name).to.equal("Header");
    expect(catalog.prop("Footer").name).to.equal("Footer");
    expect(catalog.prop("BookDetailsContainer").name).to.equal("BookDetailsContainer");
    expect(catalog.prop("authPlugins")).to.equal(authPlugins);
    expect(catalog.prop("initialState")).to.equal(store.getState());
    expect(catalog.prop("computeBreadcrumbs")).to.be.ok;
    let pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).to.equal("Example - Book");
    expect(pageTitleTemplate("Collection", null)).to.equal("Example - Collection");
  });

  it("uses home url as default collection url", () => {
    let newParams = Object.assign({}, params, { collectionUrl: null, bookUrl: null, tab: null });
    wrapper.setProps({ params: newParams });
    let catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).to.equal(context.homeUrl);
  });
});