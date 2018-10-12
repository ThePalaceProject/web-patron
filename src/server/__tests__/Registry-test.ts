import { expect } from "chai";
import { stub } from "sinon";

import Registry, { RegistryEntry, AuthDocument, RegistryCacheEntry } from "../Registry";
import { OPDSFeed } from "opds-feed-parser";

describe("Registry", () => {
  let getCatalog;
  let getAuthDocument;
  class RegistryWithCatalogAndAuthDocument extends Registry {
    getCatalog(entry: RegistryEntry): Promise<OPDSFeed> {
      return getCatalog();
    };
    getAuthDocument(catalog: OPDSFeed): Promise<AuthDocument> {
      return getAuthDocument();
    }
  }

  beforeEach(() => {
    let feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        { rel: "related", href: "http://library.org/1.html", type: "text/html", title: "One" },
        { rel: "related", href: "http://library.org/2.html", type: "text/html", title: "Two" },
        { rel: "about", href: "about.html", type: "text/html", title: "About" }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    getCatalog = stub().returns(new Promise<OPDSFeed>(resolve => resolve(feed)));
    getAuthDocument = stub().returns(new Promise<AuthDocument>(resolve => resolve({ links: [] })));
  });

  describe("getLibraryUrlTemplate", () => {
    it("fetches registry base url to get url template", async () => {
      let registry = new Registry("base url");
      let template = "/library/{uuid}";
      let registryCatalog = {
        links: [{
          rel: "http://librarysimplified.org/rel/registry/library",
          href: template
        }]
      };
      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return registryCatalog;
        }});
      }));
      fetch = mockFetch as any;

      let uncachedResult = await registry.getLibraryUrlTemplate();
      expect(uncachedResult).to.equal(template);
      expect(mockFetch.callCount).to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("base url");

      // Now the template is cached so fetch won't be called again.
      let cachedResult = await registry.getLibraryUrlTemplate();
      expect(cachedResult).to.equal(template);
      expect(mockFetch.callCount).to.equal(1);
    });

    it("throws an error if the registry returns an error", async () => {
      let registry = new Registry("base url");
      let mockFetch = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ json: () => {
          return { status: 404 };
        }});
      }));
      fetch = mockFetch as any;

      try {
        // This should raise an error since the registry response was an error.
        let result = await registry.getLibraryUrlTemplate();
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Library registry is not available");
        expect(mockFetch.callCount).to.equal(1);
      }
    });
  });

  describe("getDataFromAuthDocumentAndCatalog", () => {
    let authDocument = { links: [{
      href: "http://library.org/logo",
      rel: "logo"
    }], web_color_scheme: {
      background: "#000000",
      foreground: "#ffffff"
    }};

    let feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        { rel: "related", href: "http://library.org/1.html", type: "text/html", title: "One" },
        { rel: "related", href: "http://library.org/2.html", type: "text/html", title: "Two" },
        { rel: "about", href: "about.html", type: "text/html", title: "About" }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });

    it("returns data", () => {
      let registry = new Registry("base url");
      let data = registry.getDataFromAuthDocumentAndCatalog(authDocument, feed);
      expect(data.logoUrl).to.equal("http://library.org/logo");
      expect(data.colors).to.deep.equal(authDocument.web_color_scheme);
      expect(data.headerLinks).to.deep.equal([feed.links[0], feed.links[1]]);
    });
  });

  describe("getLibraryData", () => {
    let registryCacheEntry = {
      registryEntry: {
        links: [{
          href: "http://library.org/catalog",
          rel: "http://opds-spec.org/catalog"
        }],
        metadata: {
          updated: "20180901",
          id: "uuid",
          title: "the library"
        }
      },
      authDocument: { links: [{
        href: "http://library.org/logo",
        rel: "logo"
      }], web_color_scheme: {
        background: "#000000",
        foreground: "#ffffff"
      }},
      catalog: new OPDSFeed({
        id: "1",
        title: "Library",
        updated: "20180102",
        entries: [],
        links: [
          { rel: "related", href: "http://library.org/1.html", type: "text/html", title: "one" },
          { rel: "related", href: "http://library.org/2.html", type: "text/html", title: "two" },
          { rel: "about", href: "about.html", type: "text/html", title: "About" }
        ],
        complete: true,
        search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
        unparsed: {}
      }),
      timestamp: new Date().getTime()
    };
    let getRegistryEntry;
    // Create a mock class that already has a registry entry.
    class RegistryWithEntry extends Registry {
      async getRegistryEntry(library: string): Promise<RegistryCacheEntry> {
        return getRegistryEntry();
      }
    };

    beforeEach(() => {
      getRegistryEntry = stub().returns(new Promise(resolve => resolve(registryCacheEntry)));
    });

    it("converts cache entry to library data", async () => {
      let registry = new RegistryWithEntry("base url");
      let libraryData = await registry.getLibraryData("uuid");
      expect(libraryData.id).to.equal("uuid");
      expect(libraryData.catalogUrl).to.equal("http://library.org/catalog");
      expect(libraryData.catalogName).to.equal("the library");
      expect(libraryData.logoUrl).to.equal("http://library.org/logo");
      expect(libraryData.onlyLibrary).to.be.undefined;
      expect(libraryData.colors.background).to.equal("#000000");
      expect(libraryData.colors.foreground).to.equal("#ffffff");
      expect(libraryData.headerLinks).to.deep.equal([
        { href: "http://library.org/1.html", title: "one", rel: "related", type: "text/html" },
        { href: "http://library.org/2.html", title: "two", rel: "related", type: "text/html" }
      ]);
    });
  });

  describe("getRegistryEntry", () => {
    // Create a mock registry class that already has a url template as well
    // an auth document and catalog.
    class RegistryWithTemplate extends RegistryWithCatalogAndAuthDocument {
      protected libraryUrlTemplate = "/library/{uuid}";
    }
    let registryEntry = {
      links: [],
      metadata: {
        updated: "20180901",
        id: "uuid",
        title: "the library"
      }
    };

    it("fetches an entry if it's not in the cache", async () => {
      let registry = new RegistryWithTemplate("base url");
      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return { catalogs: [registryEntry] };
        }});
      }));
      fetch = mockFetch as any;

      let uncachedResult = await registry.getRegistryEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.deep.equal({ links: [] });
      expect(mockFetch.callCount).to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache so fetch won't be called again.
      let cachedResult = await registry.getRegistryEntry("uuid");
      expect(cachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(cachedResult.authDocument).to.deep.equal({ links: [] });
      expect(mockFetch.callCount).to.equal(1);
    });

    it("fetches an entry if it's in the cache but expired", async () => {
      let registry = new RegistryWithTemplate("base url", 1);

      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return { catalogs: [registryEntry] };
        }});
      }));
      fetch = mockFetch as any;

      let uncachedResult = await registry.getRegistryEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.deep.equal({ links: [] });
      expect(mockFetch.callCount).to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount).to.equal(1);

      // Now the entry is in the cache, but if we wait more than 1 second
      // it will be expired.
      await new Promise<void>(resolve => setTimeout(resolve, 1001));
      let cacheExpiredResult = await registry.getRegistryEntry("uuid");
      expect(cacheExpiredResult.registryEntry).to.deep.equal(registryEntry);
      expect(cacheExpiredResult.authDocument).to.deep.equal({ links: [] });
      expect(mockFetch.callCount).to.equal(2);
      expect(mockFetch.args[1][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount).to.equal(2);
    });

    it("ignores errors fetching the auth document", async () => {
      let registry = new RegistryWithTemplate("base url");
      getAuthDocument.returns(new Promise<AuthDocument>((resolve, reject) => reject()));

      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return { catalogs: [registryEntry] };
        }});
      }));
      fetch = mockFetch as any;

      let uncachedResult = await registry.getRegistryEntry("uuid");
      expect(uncachedResult.registryEntry).to.deep.equal(registryEntry);
      expect(uncachedResult.authDocument).to.be.undefined;
      expect(mockFetch.callCount, "fetch call count").to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("/library/uuid");
      expect(getAuthDocument.callCount, "getAuthDocument call count").to.equal(1);
    });

    it("throws an error if there's an error fetching the catalog", async () => {
      let registry = new RegistryWithTemplate("base url");
      getCatalog.returns(new Promise<OPDSFeed>((resolve, reject) => reject()));

      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return { catalogs: [registryEntry] };
        }});
      }));
      fetch = mockFetch as any;

      try {
        let result = await registry.getRegistryEntry("uuid");
        // Fail the test if it's successful
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(mockFetch.callCount).to.equal(1);
        expect(getCatalog.callCount).to.equal(1);
      }
    });

    it("throws an error if the registry response doesn't have a library catalog.", async () => {
      let registry = new RegistryWithTemplate("base url");
      let mockFetch = stub().returns(new Promise<any>((resolve) => {
        resolve({ json: () => {
          return { catalogs: [] };
        }});
      }));
      fetch = mockFetch as any;

      try {
        // This should raise an error since the registry response does not have a catalog.
        let result = await registry.getRegistryEntry("uuid");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(mockFetch.callCount).to.equal(1);
      }
    });

    it("throws an error if the registry returns a problem detail", async () => {
      let registry = new RegistryWithTemplate("base url");
      let mockFetch = stub().returns(new Promise<any>((resolve, reject) => {
        reject({ json: () => {
          return { status: 404 };
        }});
      }));
      fetch = mockFetch as any;

      try {
        // This should raise an error since the registry response was an error.
        let result = await registry.getRegistryEntry("uuid");
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("This library is not available");
        expect(mockFetch.callCount).to.equal(1);
      }
    });
  });

  describe("getCatalog", () => {
    let registry = new Registry("base url");
    let registryEntry = {
      links: [{
        href: "http://library.org/catalog",
        rel: "http://opds-spec.org/catalog"
      }],
      metadata: {
        updated: "20180901",
        id: "uuid",
        title: "the library"
      }
    };
    let opdsFeed = `<feed xmlns:app="http://www.w3.org/2007/app" xmlns:bib="http://bib.schema.org/" xmlns:bibframe="http://bibframe.org/vocab/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:drm="http://librarysimplified.org/terms/drm" xmlns:opds="http://opds-spec.org/2010/catalog" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:schema="http://schema.org/" xmlns:simplified="http://librarysimplified.org/terms/" xmlns="http://www.w3.org/2005/Atom" simplified:entryPoint="http://schema.org/EBook">
      <id>http://library.org/catalog</id>
      <title>Library</title>
      <link href="http://library.org/authentication_document" rel="http://opds-spec.org/auth/document"/>
      </feed>`;

    it("fetches a catalog", async () => {
      let mockFetch = stub();
      mockFetch.returns(new Promise<any>((resolve) => {
        resolve({ text: () => opdsFeed });
      }));
      fetch = mockFetch as any;

      let result = await registry.getCatalog(registryEntry);
      expect(result.id).to.equal("http://library.org/catalog");
      expect(result.title).to.equal("Library");
      expect(result.links.length).to.equal(1);
      expect(result.links[0].rel).to.equal("http://opds-spec.org/auth/document");
      expect(result.links[0].href).to.equal("http://library.org/authentication_document");
      expect(mockFetch.callCount).to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("http://library.org/catalog");
    });

    it("returns an error if the registry entry doesn't have a catalog url", async () => {
      let registryEntryWithoutCatalog = { ...registryEntry, links: [] };
      try {
        // This should raise an error.
        let result = await registry.getCatalog(registryEntryWithoutCatalog);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Registry entry does not have a catalog URL");
      }
    });

    it("returns an error if it can't fetch the catalog", async () => {
      let mockFetch = stub();
      mockFetch.returns(new Promise<any>((resolve, reject) => reject()));
      fetch = mockFetch as any;
      try {
        // This should raise an error.
        let result = await registry.getCatalog(registryEntry);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get OPDS catalog");
        expect(mockFetch.callCount).to.equal(1);
      }
    });

    it("returns an error if fetching the catalog does not return an OPDS feed", async () => {
      let mockFetch = stub();
      mockFetch.returns(new Promise<any>((resolve) => {
        resolve({ text: () => "not OPDS" });
      }));
      fetch = mockFetch as any;
      try {
        // This should raise an error.
        let result = await registry.getCatalog(registryEntry);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get OPDS catalog");
        expect(mockFetch.callCount).to.equal(1);
      }
    });
  });

  describe("getAuthDocument", () => {
    let registry = new Registry("base url");
    let feed = new OPDSFeed({
      id: "1",
      title: "Library",
      updated: "20180102",
      entries: [],
      links: [
        { rel: "related", href: "http://library.org/1.html", type: "text/html", title: "One" },
        { rel: "related", href: "http://library.org/2.html", type: "text/html", title: "Two" },
        { rel: "http://opds-spec.org/auth/document", href: "http://library.org/authentication_document", type: "application/json", title: "Auth" }
      ],
      complete: true,
      search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
      unparsed: {}
    });
    let authDoc = {
      links: []
    };

    it("fetches an auth document", async () => {
      let mockFetch = stub();
      mockFetch.returns(new Promise<any>((resolve) => {
        resolve({ json: () => authDoc });
      }));
      fetch = mockFetch as any;

      let result = await registry.getAuthDocument(feed);
      expect(result).to.equal(authDoc);
      expect(mockFetch.callCount).to.equal(1);
      expect(mockFetch.args[0][0]).to.equal("http://library.org/authentication_document");
    });

    it("returns an error if the catalog does not have an auth document url", async () => {
      let mockFetch = stub();
      let feedWithoutAuthDoc = new OPDSFeed({
        id: "1",
        title: "Library",
        updated: "20180102",
        entries: [],
        links: [],
        complete: true,
        search: { totalResults: 0, startIndex: 0, itemsPerPage: 0 },
        unparsed: {}
      });
      try {
        // This should raise an error.
        let result = await registry.getAuthDocument(feedWithoutAuthDoc);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not find authentication document");
      }
    });

    it("returns an error if it can't fetch the auth document", async () => {
      let mockFetch = stub();
      mockFetch.returns(new Promise<any>((resolve, reject) => reject()));
      fetch = mockFetch as any;
      try {
        // This should raise an error.
        let result = await registry.getAuthDocument(feed);
        // Fail the test if it's successful.
        expect(true, "no error was raised").to.equal(false);
      } catch (error) {
        expect(error).to.contain("Could not get authentication document");
        expect(mockFetch.callCount).to.equal(1);
      }
    });
  });
});
