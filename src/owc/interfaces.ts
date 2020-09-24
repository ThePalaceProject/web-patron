import { BookData, CollectionData, LinkData } from "interfaces";
/* eslint-disable camelcase */

// these properties need to be optional because they're used by RootProps,
// which doesn't implement them until Root is connected to the state by redux;
// initially, Root isn't provided most of these props
export interface StateProps {
  collectionData?: CollectionData;
  collectionUrl?: string;
  isFetchingCollection?: boolean;
  isFetchingBook?: boolean;
  error?: FetchErrorData;
  bookData?: BookData;
  bookUrl?: string;
  isFetchingPage?: boolean;
  history?: LinkData[];
  preferences?: {
    [key: string]: string;
  };
}

export interface PathFor {
  (collectionUrl?: string | null, bookUrl?: string | null): string;
}

export interface FetchErrorData {
  status: number | null;
  response: string;
  url: string;
}

export interface Location {
  pathname: string;
  state?: any;
}

export interface Router {
  push: (location: string | Location) => any;
  createHref: (location: string | Location) => string;
}

export interface NavigateContext {
  router?: Router;
  pathFor: PathFor;
}

/** Utility to make keys K of type T both required (defined) and not null */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> &
  { [P in K]-?: NonNullable<T[P]> };

export type SamlIdp = {
  privacy_statement_urls: [];
  logo_urls: [];
  display_names: [
    {
      language: string;
      value: string;
    }
  ];
  href: string;
  descriptions: [
    {
      language: string;
      value: string;
    }
  ];
  rel: "authenticate";
  information_urls: [];
};
