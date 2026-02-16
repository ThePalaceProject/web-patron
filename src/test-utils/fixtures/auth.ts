import {
  ClientBasicMethod,
  ClientBasicTokenMethod,
  ClientCleverMethod,
  ClientSamlMethod,
  ClientOidcMethod,
  CollectionData
} from "interfaces";
import { OPDS1 } from "interfaces";
import { makeFulfillableBooks } from "test-utils/fixtures/book";

export const basicAuthId = "http://opds-spec.org/auth/basic";
export const basicTokenAuthId =
  "http://thepalaceproject.org/authtype/basic-token";
export const samlAuthId = "http://librarysimplified.org/authtype/SAML-2.0";
export const oidcAuthId = "http://thepalaceproject.org/authtype/OpenIDConnect";

export const basicTokenAuthenticationUrl =
  "https://exmple.com/patrons/me/token/";

export const unsupportedAuthId = "http://opds-spec.org/auth/oauth/implicit";

export const basicAuthMethod: ClientBasicMethod = {
  id: "client-basic",
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: basicAuthId,
  description: "Library Barcode",
  links: [
    {
      href: "https://example.com/LoginButton280.png",
      rel: "logo"
    }
  ]
};

export const basicTokenAuthMethod: ClientBasicTokenMethod = {
  id: "client-basic-token",
  labels: {
    login: "Barcode",
    password: "Pin"
  },
  type: basicTokenAuthId,
  description: "Library Barcode",
  links: [
    {
      rel: "authenticate",
      href: basicTokenAuthenticationUrl
    },
    {
      href: "https://example.com/LoginButton280.png",
      rel: "logo"
    }
  ]
};

export const cleverAuthMethod: ClientCleverMethod = {
  id: "client-clever",
  description: "Clever",
  links: [
    {
      href: "https://example.com/oauth_authenticate?provider=Clever",
      rel: "authenticate"
    },
    {
      href: "https://example.com/CleverLoginButton280.png",
      rel: "logo"
    }
  ],
  type: OPDS1.CleverAuthType
};

export const samlAuthHref = "/saml-auth-url";
export const clientSamlMethod: ClientSamlMethod = createSamlMethod(0);

export function createSamlMethod(num: number): ClientSamlMethod {
  return {
    id: `id-${num}`,
    href: `https://saml-auth.com/${num}`,
    type: OPDS1.SamlAuthType,
    description: `SAML IdP ${num}`,
    links: [
      {
        href: "https://example.com/LoginButton280.png",
        rel: "logo"
      }
    ]
  };
}

export const oidcAuthHref = "/oidc-auth-url";
export const clientOidcMethod: ClientOidcMethod = createOidcMethod(0);

export function createOidcMethod(num: number): ClientOidcMethod {
  return {
    id: `id-${num}`,
    href: `https://oidc-auth.com/${num}`,
    type: OPDS1.OidcAuthType,
    description: `OIDC Provider ${num}`,
    links: [
      {
        href: "https://example.com/LoginButton280.png",
        rel: "logo"
      }
    ]
  };
}

export const unsupportedAuthMethod = {
  id: "unsupported-auth-method",
  description: "Unsupported auth method",
  links: [
    {
      rel: "authenticate",
      href: "https://example.com/oauth"
    }
  ],
  type: unsupportedAuthId
};

export const loans: CollectionData = {
  id: "loans-id",
  url: "/loans-url",
  title: "My Loans",
  lanes: [],
  books: makeFulfillableBooks(1),
  navigationLinks: [],
  searchDataUrl: "/search-data-url"
};
