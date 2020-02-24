import * as React from "react";
import { shallow } from "enzyme";
import * as tinycolor from "tinycolor2";
import CatalogHandler from "../CatalogHandler";
import OPDSCatalog from "opds-web-client/lib/components/OPDSCatalog";
import buildStore from "opds-web-client/lib/store";
import UrlShortener from "../../UrlShortener";

describe("CatalogHandler", () => {
  let wrapper;
  let store;
  let match;
  let context;
  let child;
  const name = "Example";

  beforeEach(() => {
    store = buildStore();
    // const match = {
    //   collectionUrl: "collectionurl",
    //   bookUrl: "library/bookurl",
    //   tab: "tab"
    // };
    context = {
      library: {
        id: "uuid",
        catalogUrl: "http://example.com/home",
        catalogName: name,
        logoUrl: "http://example.com/logo"
      },
      urlShortener: new UrlShortener("http://example.com/home", false),
      initialState: store.getState()
    };
  });

  test("renders OPDSCatalog", () => {
    wrapper = shallow(<CatalogHandler />, { context });

    const catalog = wrapper.find(OPDSCatalog);
    expect(catalog.prop("collectionUrl")).toBe("collectionurl");
    expect(catalog.prop("bookUrl")).toBe("library/bookurl");
    expect(catalog.prop("Header").name).toBe("Header");
    expect(catalog.prop("Footer").name).toBe("Footer");
    expect(catalog.prop("BookDetailsContainer").name).toBe(
      "BookDetailsContainer"
    );
    expect(catalog.prop("initialState")).toBe(store.getState());
    expect(catalog.prop("computeBreadcrumbs")).toBeTruthy();
    const pageTitleTemplate = catalog.prop("pageTitleTemplate");
    expect(pageTitleTemplate("Collection", "Book")).toBe("Example - Book");
    expect(pageTitleTemplate("Collection", null)).toBe("Example - Collection");
  });

  test("renders div with CSS variables", () => {
    let div = wrapper.find("div");
    let cssVariables = div.prop("style");
    expect(cssVariables["--logo"]).toBe("url('http://example.com/logo')");

    // Since we haven't defined colors in the context, they're defaults.

    expect(cssVariables["--pagecolor"]).toBe("#ffffff");
    expect(cssVariables["--pagecolorlight"]).toBe("#fafafa");
    expect(cssVariables["--footercolor"]).toBe("#fafafa");
    expect(cssVariables["--transparentpagecolor"]).toBe(
      "rgba(255, 255, 255, 0.5)"
    );
    expect(cssVariables["--semitransparentpagecolor"]).toBe(
      "rgba(255, 255, 255, 0.9)"
    );

    expect(cssVariables["--linkcolor"]).toBe("#000000");
    expect(cssVariables["--linkvisitedcolor"]).toBe("#333333");
    expect(cssVariables["--linkhovercolor"]).toBe("#1a1a1a");
    expect(cssVariables["--pagetextcolor"]).toBe("#000000");
    expect(cssVariables["--pagetextcolorlight"]).toBe("#000000");
    expect(cssVariables["--highlightcolor"]).toBe("#000000");

    const library = {
      ...context.library,
      colors: { background: "#000000", foreground: "#ffffff" }
    };
    wrapper.setContext({ ...context, library });
    div = wrapper.find("div");
    cssVariables = div.prop("style");

    expect(cssVariables["--pagecolor"]).toBe("#000000");
    expect(cssVariables["--pagecolorlight"]).toBe("#050505");
    expect(cssVariables["--footercolor"]).toBe("#050505");
    expect(cssVariables["--transparentpagecolor"]).toBe("rgba(0, 0, 0, 0.5)");
    expect(cssVariables["--semitransparentpagecolor"]).toBe(
      "rgba(0, 0, 0, 0.9)"
    );

    expect(cssVariables["--linkcolor"]).toBe("#ffffff");
    expect(cssVariables["--linkvisitedcolor"]).toBe("#cccccc");
    expect(cssVariables["--linkhovercolor"]).toBe("#e6e6e6");
    expect(cssVariables["--pagetextcolor"]).toBe("#ffffff");
    expect(cssVariables["--pagetextcolorlight"]).toBe("#ffffff");
    expect(cssVariables["--highlightcolor"]).toBe("#ffffff");
  });
});
