/* eslint-disable camelcase */
// snake_case properties are defined by an external API we don't control.
import {
  normalizeLink,
  expandTemplatedUri,
  UriTemplateTerms
} from "utils/opds";
import { OPDS2 } from "interfaces";

// ---------------------------------------------------------------------------
// expandTemplatedUri
// ---------------------------------------------------------------------------

describe("expandTemplatedUri", () => {
  const redirectTerm = UriTemplateTerms.REDIRECT_URI;

  const varMap: OPDS2.UriTemplateVariableMap["map"] = {
    post_logout_redirect_uri: { term: redirectTerm }
  };

  test("expands a template variable via termValues", () => {
    const result = expandTemplatedUri(
      "http://example.com/logout{?post_logout_redirect_uri}",
      varMap,
      { termValues: { [redirectTerm]: "https://app.example.com/signed-out" } }
    );
    expect(result).toBe(
      "http://example.com/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.example.com%2Fsigned-out"
    );
  });

  test("falls back to fallbacks map when variable has no term match", () => {
    const result = expandTemplatedUri(
      "http://example.com/logout{?post_logout_redirect_uri}",
      varMap,
      {
        fallbacks: {
          post_logout_redirect_uri: "https://app.example.com/signed-out"
        }
      }
    );
    expect(result).toBe(
      "http://example.com/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.example.com%2Fsigned-out"
    );
  });

  test("prefers termValues over fallbacks", () => {
    const result = expandTemplatedUri(
      "http://example.com/logout{?post_logout_redirect_uri}",
      varMap,
      {
        termValues: { [redirectTerm]: "https://term-value.example.com/" },
        fallbacks: { post_logout_redirect_uri: "https://fallback.example.com/" }
      }
    );
    expect(result).toContain("term-value.example.com");
    expect(result).not.toContain("fallback.example.com");
  });

  test("throws when a required variable has no value", () => {
    expect(() =>
      expandTemplatedUri(
        "http://example.com/logout{?post_logout_redirect_uri}",
        varMap
      )
    ).toThrow(/Required URI template variable "post_logout_redirect_uri"/);
  });

  test("omits an optional variable (required: false) when no value is provided", () => {
    const optionalVarMap: OPDS2.UriTemplateVariableMap["map"] = {
      hint: { term: "http://example.com/terms/hint", required: false }
    };
    const result = expandTemplatedUri(
      "http://example.com/login{?hint}",
      optionalVarMap
    );
    // RFC 6570: undefined value omits the variable entirely.
    expect(result).toBe("http://example.com/login");
  });

  test("treats a variable with no varMap entry as required and throws", () => {
    expect(() =>
      expandTemplatedUri("http://example.com/logout{?unknown}", {})
    ).toThrow(/Required URI template variable "unknown"/);
  });

  test("returns a plain string for a template with no variables", () => {
    const result = expandTemplatedUri("http://example.com/logout", {});
    expect(result).toBe("http://example.com/logout");
  });
});

// ---------------------------------------------------------------------------
// normalizeLink
// ---------------------------------------------------------------------------

describe("normalizeLink", () => {
  const redirectTerm = UriTemplateTerms.REDIRECT_URI;
  const signedOutUrl = "https://app.example.com/signed-out";

  const templatedLink = {
    href: "http://example.com/logout?provider=Test{&post_logout_redirect_uri}",
    rel: "logout",
    templated: true as const,
    properties: {
      uri_template_variables: {
        "@type": "http://palaceproject.io/terms/uri-template/variables",
        map: {
          post_logout_redirect_uri: { term: redirectTerm }
        }
      }
    }
  };

  test("returns non-templated link unchanged", () => {
    const link = { href: "http://example.com/logout", rel: "logout" };
    expect(normalizeLink(link)).toBe(link);
  });

  test("expands the href and removes the templated property", () => {
    const result = normalizeLink(templatedLink, {
      termValues: { [redirectTerm]: signedOutUrl }
    });
    expect(result.href).toContain("post_logout_redirect_uri=");
    expect(result).not.toHaveProperty("templated");
  });

  test("preserves all other link properties", () => {
    const result = normalizeLink(templatedLink, {
      termValues: { [redirectTerm]: signedOutUrl }
    });
    expect(result.rel).toBe("logout");
    expect(result.properties).toBe(templatedLink.properties);
  });

  test("expands via fallbacks when termValues is absent", () => {
    const result = normalizeLink(templatedLink, {
      fallbacks: { post_logout_redirect_uri: signedOutUrl }
    });
    expect(result.href).toContain("post_logout_redirect_uri=");
  });

  test("throws when a required variable cannot be resolved", () => {
    expect(() => normalizeLink(templatedLink)).toThrow(
      /Required URI template variable/
    );
  });
});
