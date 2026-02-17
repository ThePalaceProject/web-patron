/* eslint-disable camelcase */
// OPDS spec uses snake_case property names (display_names, logo_urls, etc.).
// These are external API properties not under our control.
import { describe, expect, test } from "@jest/globals";
import {
  generateCredentials,
  isServerOidcMethod,
  isServerSamlMethod,
  normalizeAuthMethods,
  getEnglishValue
} from "../auth";
import { OPDS1 } from "interfaces";

describe("generateCredentials", () => {
  test("returns basic auth credentials for the username and password", () => {
    const username = "foo";
    const password = "bar";
    const encoded = btoa(`${username}:${password}`);

    expect(generateCredentials(username, password)).toEqual(`Basic ${encoded}`);
  });

  test("treats undefined password as empty string", () => {
    const username = "foo";
    const encoded = btoa(`${username}:`);

    expect(generateCredentials(username)).toEqual(`Basic ${encoded}`);
  });
});

describe("isServerOidcMethod", () => {
  test("returns true for OIDC methods with links", () => {
    const oidcMethod: OPDS1.ServerOidcMethod = {
      type: OPDS1.OidcAuthType,
      description: "OIDC Provider",
      links: [
        {
          href: "https://oidc.example.com",
          rel: "authenticate",
          display_names: [{ language: "en", value: "Test OIDC" }],
          descriptions: [
            { language: "en", value: "OIDC provider description" }
          ],
          logo_urls: [],
          privacy_statement_urls: [],
          information_urls: []
        }
      ]
    };

    expect(isServerOidcMethod(oidcMethod)).toBe(true);
  });

  test("returns false for non-OIDC methods", () => {
    const basicMethod: OPDS1.BasicAuthMethod = {
      type: OPDS1.BasicAuthType,
      description: "Basic Auth",
      labels: { login: "Username", password: "Password" }
    };

    expect(isServerOidcMethod(basicMethod)).toBe(false);
  });

  test("returns false for OIDC methods without links", () => {
    const oidcMethodNoLinks: OPDS1.ServerAuthMethod = {
      type: OPDS1.OidcAuthType,
      description: "OIDC Provider"
      // Edge case: intentionally missing 'links' property
    } as any;

    expect(isServerOidcMethod(oidcMethodNoLinks)).toBe(false);
  });

  test("returns false for SAML methods", () => {
    const samlMethod: OPDS1.ServerSamlMethod = {
      type: OPDS1.SamlAuthType,
      description: "SAML Provider",
      links: [
        {
          href: "https://saml.example.com",
          rel: "authenticate",
          display_names: [{ language: "en", value: "Test SAML" }],
          descriptions: [
            { language: "en", value: "SAML provider description" }
          ],
          logo_urls: [],
          privacy_statement_urls: [],
          information_urls: []
        }
      ]
    };

    expect(isServerOidcMethod(samlMethod)).toBe(false);
  });
});

describe("isServerSamlMethod", () => {
  test("returns true for SAML methods with links", () => {
    const samlMethod: OPDS1.ServerSamlMethod = {
      type: OPDS1.SamlAuthType,
      description: "SAML Provider",
      links: [
        {
          href: "https://saml.example.com",
          rel: "authenticate",
          display_names: [{ language: "en", value: "Test SAML" }],
          descriptions: [
            { language: "en", value: "SAML provider description" }
          ],
          logo_urls: [],
          privacy_statement_urls: [],
          information_urls: []
        }
      ]
    };

    expect(isServerSamlMethod(samlMethod)).toBe(true);
  });

  test("returns false for non-SAML methods", () => {
    const basicMethod: OPDS1.BasicAuthMethod = {
      type: OPDS1.BasicAuthType,
      description: "Basic Auth",
      labels: { login: "Username", password: "Password" }
    };

    expect(isServerSamlMethod(basicMethod)).toBe(false);
  });
});

describe("getEnglishValue", () => {
  test("returns English value from array", () => {
    const values = [
      { language: "es", value: "Español" },
      { language: "en", value: "English" },
      { language: "fr", value: "Français" }
    ];

    expect(getEnglishValue(values)).toBe("English");
  });

  test("returns undefined when no English value exists", () => {
    const values = [
      { language: "es", value: "Español" },
      { language: "fr", value: "Français" }
    ];

    expect(getEnglishValue(values)).toBeUndefined();
  });
});

describe("normalizeAuthMethods", () => {
  test("includes OIDC methods in output", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          description: "OIDC Provider",
          links: [
            {
              href: "https://oidc.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "Test OIDC" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "https://oidc.example.com",
      href: "https://oidc.example.com",
      type: OPDS1.OidcAuthType,
      description: "Test OIDC"
    });
  });

  test("uses first OIDC link only", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          description: "OIDC Provider",
          links: [
            {
              href: "https://oidc1.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "OIDC 1" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            },
            {
              href: "https://oidc2.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "OIDC 2" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("https://oidc1.example.com");
    expect(result[0].description).toBe("OIDC 1");
  });

  test("handles OIDC methods with missing links", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          description: "OIDC Provider",
          links: []
        } as OPDS1.ServerOidcMethod // Edge case: testing empty links array
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    // Should return empty array when OIDC has no links
    expect(result).toHaveLength(0);
  });

  test("uses display_name from link for OIDC description", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          description: "Fallback Description",
          links: [
            {
              href: "https://oidc.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "Custom OIDC Name" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result[0].description).toBe("Custom OIDC Name");
  });

  test("falls back to method description when link has no display_name", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          description: "Method Description",
          links: [
            {
              href: "https://oidc.example.com",
              rel: "authenticate",
              display_names: [] as any, // Edge case: testing empty display_names
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result[0].description).toBe("Method Description");
  });

  test("uses default description when both are missing", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.OidcAuthType,
          // Edge case: testing missing description field
          links: [
            {
              href: "https://oidc.example.com",
              rel: "authenticate",
              display_names: [] as any, // Edge case: empty display_names
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        } as OPDS1.ServerOidcMethod
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result[0].description).toBe("OIDC Provider");
  });

  test("expands multiple SAML IdPs into separate methods", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.SamlAuthType,
          description: "SAML Provider",
          links: [
            {
              href: "https://idp1.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "IDP 1" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            },
            {
              href: "https://idp2.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "IDP 2" }],
              descriptions: [{ language: "en", value: "Description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "https://idp1.example.com",
      href: "https://idp1.example.com",
      type: OPDS1.SamlAuthType,
      description: "IDP 1"
    });
    expect(result[1]).toEqual({
      id: "https://idp2.example.com",
      href: "https://idp2.example.com",
      type: OPDS1.SamlAuthType,
      description: "IDP 2"
    });
  });

  test("handles mixed auth methods correctly", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.BasicAuthType,
          description: "Basic Auth",
          labels: { login: "Username", password: "Password" }
        },
        {
          type: OPDS1.SamlAuthType,
          description: "SAML Provider",
          links: [
            {
              href: "https://saml.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "SAML IDP" }],
              descriptions: [{ language: "en", value: "SAML description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        },
        {
          type: OPDS1.OidcAuthType,
          description: "OIDC Provider",
          links: [
            {
              href: "https://oidc.example.com",
              rel: "authenticate",
              display_names: [{ language: "en", value: "OIDC IDP" }],
              descriptions: [{ language: "en", value: "OIDC description" }],
              logo_urls: [],
              privacy_statement_urls: [],
              information_urls: []
            }
          ]
        },
        {
          type: OPDS1.CleverAuthType,
          description: "Clever"
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result).toHaveLength(4);

    // Basic auth gets ID from type
    expect(result[0]).toMatchObject({
      id: OPDS1.BasicAuthType,
      type: OPDS1.BasicAuthType
    });

    // SAML gets ID from href
    expect(result[1]).toMatchObject({
      id: "https://saml.example.com",
      href: "https://saml.example.com",
      type: OPDS1.SamlAuthType,
      description: "SAML IDP"
    });

    // OIDC gets ID from href
    expect(result[2]).toMatchObject({
      id: "https://oidc.example.com",
      href: "https://oidc.example.com",
      type: OPDS1.OidcAuthType,
      description: "OIDC IDP"
    });

    // Clever gets ID from type
    expect(result[3]).toMatchObject({
      id: OPDS1.CleverAuthType,
      type: OPDS1.CleverAuthType
    });
  });

  test("handles basic auth methods by adding ID from type", () => {
    const authDoc: OPDS1.AuthDocument = {
      id: "test-auth-doc",
      title: "Test Library",
      authentication: [
        {
          type: OPDS1.BasicAuthType,
          description: "Basic Auth",
          labels: { login: "Username", password: "Password" }
        }
      ]
    };

    const result = normalizeAuthMethods(authDoc);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: OPDS1.BasicAuthType,
      type: OPDS1.BasicAuthType,
      description: "Basic Auth"
    });
  });
});
