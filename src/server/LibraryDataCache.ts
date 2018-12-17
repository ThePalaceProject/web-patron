require("isomorphic-fetch");
import OPDSParser, { OPDSFeed } from "opds-feed-parser";
import { Link, LibraryData } from "../interfaces";

export interface RegistryEntry {
  links: Link[];
  metadata?: {
    updated: string;
    id: string;
    title: string;
  };
}

export interface AuthDocument {
  title: string;
  links: Link[];
  web_color_scheme?: {
    background?: string;
    foreground?: string;
  };
}

export interface CacheEntry {
  registryEntry: RegistryEntry;
  catalog?: OPDSFeed;
  authDocument?: AuthDocument;
  timestamp: number;
}


export default class LibraryDataCache {
  // An in-memory cache of registry entries and authentication documents.
  // Registry entries don't change very often, and it's fine to fetch them
  // again if we restart the server. It's also not a problem if simultaneous
  // requests update the same registry entry, since they'll get the same
  // data from the registry.
  private readonly CACHE: { [key: string]: CacheEntry } = {};
  private readonly registryBase: string;
  private readonly expirationSeconds: number;
  protected libraryUrlTemplate: string = null;

  constructor(registryBase: string, expirationSeconds: number = 60 * 60 * 24) {
    this.registryBase = registryBase;
    this.expirationSeconds = expirationSeconds;
  }

  async getLibraryUrlTemplate(): Promise<string> {
    if (!this.libraryUrlTemplate) {
      try {
        const registryResponse = await fetch(this.registryBase);
        const registryCatalog = await registryResponse.json();
        const links = registryCatalog.links;
        for (const link of links) {
          if (link.rel === "http://librarysimplified.org/rel/registry/library") {
            this.libraryUrlTemplate = link.href;
            break;
          }
        }
      } catch (error) {
        throw "Library registry is not available.";
      }
    }
    return this.libraryUrlTemplate;
  }

  getDataFromAuthDocumentAndCatalog(authDocument: AuthDocument, catalog: OPDSFeed) {
    let catalogName = authDocument["title"];
    let logoUrl;
    for (const link of authDocument.links) {
      if (link.rel === "logo") {
        logoUrl = link.href;
        break;
      }
    }
    let colors = authDocument["web_color_scheme"];

    let headerLinks = [];
    for (const link of catalog["links"]) {
      if (link.role === "navigation") {
        headerLinks.push(link);
      }
    }

    return {
      catalogName,
      logoUrl,
      colors,
      headerLinks
    };

  }

  async getLibraryData(library: string): Promise<LibraryData> {
    const entry = await this.getCacheEntry(library);
    let catalogUrl;
    for (const link of entry.registryEntry.links) {
      if (link.rel === "http://opds-spec.org/catalog") {
        catalogUrl = link.href;
        break;
      }
    }
    let catalogName = entry.registryEntry.metadata.title;

    return {
      id: library,
      catalogUrl,
      catalogName,
      ...this.getDataFromAuthDocumentAndCatalog(entry.authDocument, entry.catalog)
    };
  }

  async getCacheEntry(library: string): Promise<CacheEntry> {
    const template = await this.getLibraryUrlTemplate();
    const libraryUrl = template.replace("{uuid}", library);

    // Make sure the library is cached.
    const currentEntry = this.CACHE[library];
    const now = new Date().getTime();
    if (!currentEntry || (currentEntry.timestamp + this.expirationSeconds * 1000 < now)) {
      try {
        const registryResponse = await fetch(libraryUrl);
        const registryCatalog = await registryResponse.json();
        const registryEntry = registryCatalog.catalogs[0];
        if (!registryCatalog.catalogs || registryCatalog.catalogs.length !== 1) {
          throw "Registry did not return a catalog for this library id: " + library;
        }
        let catalog = currentEntry && currentEntry.catalog;
        try {
          catalog = await this.getCatalog(registryEntry);
        } catch (catalogError) {
          // If we can't get the catalog, patrons won't be able to use the application
          // anyway.
          console.warn(catalogError);
          throw "This library is not available.";
        }

        let authDocument = currentEntry && currentEntry.authDocument;
        try {
          authDocument = await this.getAuthDocument(catalog);
        } catch (authDocError) {
          // If we can't get the authentication document, keep the previous cached
          // version or proceed without one.
          console.warn(authDocError);
        }
        this.CACHE[library] = { registryEntry, catalog, authDocument, timestamp: new Date().getTime() };
      } catch (error) {
        console.warn(error);
        throw "This library is not available.";
      }
    }
    return this.CACHE[library];
  }

  async getCatalog(entry: RegistryEntry): Promise<OPDSFeed> {
    // Find the catalog root in the registry entry.
    let rootUrl;
    for (const link of entry["links"]) {
      if (link.rel === "http://opds-spec.org/catalog") {
        rootUrl = link.href;
        break;
      }
    }
    if (!rootUrl) {
      throw "Registry entry does not have a catalog URL";
    }
    let catalog: OPDSFeed;
    try {
      const catalogResponse = await fetch(rootUrl);
      const rawCatalog = await catalogResponse.text();
      const parser = new OPDSParser();
      const parsedCatalog = await parser.parse(rawCatalog);
      if (parsedCatalog instanceof OPDSFeed) {
        catalog = parsedCatalog;
      }
    } catch (error) {
      throw "Could not get OPDS catalog at " + rootUrl;
    }
    if (!catalog) {
      throw "Could not get OPDS catalog at " + rootUrl;
    }
    return catalog;
  }

  async getAuthDocument(catalog: OPDSFeed): Promise<AuthDocument> {
    // Find the auth document link.
    let authDocLink;
    for (const link of catalog["links"]) {
      if (link.rel === "http://opds-spec.org/auth/document") {
        authDocLink = link.href;
        break;
      }
    }
    if (!authDocLink) {
      throw "Could not find authentication document in OPDS catalog";
    }
    try {
      const authDocResponse = await fetch(authDocLink);
      const authDoc = await authDocResponse.json();
      return authDoc;
    } catch (error) {
      throw "Could not get authentication document at " + authDocLink;
    }
  }
}