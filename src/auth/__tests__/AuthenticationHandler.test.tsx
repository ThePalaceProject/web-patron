import * as React from "react";
import { fixtures, render } from "test-utils";
import AuthenticationHandler, {
  authHandlers,
  isSupportedAuthType
} from "../AuthenticationHandler";
import { OPDS1 } from "interfaces";

describe("AuthenticationHandler", () => {
  test("renders OidcAuthHandler for OIDC method", () => {
    const utils = render(
      <AuthenticationHandler method={fixtures.clientOidcMethod} />
    );
    expect(
      utils.getByText("Logging in with OIDC Provider 0...")
    ).toBeInTheDocument();
  });

  test("renders SamlAuthHandler for SAML method", () => {
    const utils = render(
      <AuthenticationHandler method={fixtures.clientSamlMethod} />
    );
    expect(
      utils.getByText("Logging in with SAML IdP 0...")
    ).toBeInTheDocument();
  });

  test("renders CleverAuthHandler for Clever method", () => {
    const utils = render(
      <AuthenticationHandler method={fixtures.cleverAuthMethod} />
    );
    expect(utils.getByText("Logging in with Clever...")).toBeInTheDocument();
  });

  test("renders BasicAuthHandler for Basic method", () => {
    const utils = render(
      <AuthenticationHandler method={fixtures.basicAuthMethod} />
    );
    expect(utils.getByLabelText("Barcode")).toBeInTheDocument();
    expect(utils.getByLabelText("Pin")).toBeInTheDocument();
  });

  test("renders BasicTokenAuthHandler for BasicToken method", () => {
    const utils = render(
      <AuthenticationHandler method={fixtures.basicTokenAuthMethod} />
    );
    expect(utils.getByLabelText("Barcode")).toBeInTheDocument();
    expect(utils.getByLabelText("Pin")).toBeInTheDocument();
  });

  test("renders error message for unsupported method type", () => {
    const unsupportedMethod = {
      id: "unsupported",
      type: "http://opds-spec.org/auth/oauth/implicit" as any,
      description: "Unsupported"
    };

    const utils = render(<AuthenticationHandler method={unsupportedMethod} />);
    expect(
      utils.getByText("This authentication method is not supported.")
    ).toBeInTheDocument();
  });
});

describe("authHandlers map", () => {
  test("includes all expected auth types", () => {
    const expectedTypes = [
      OPDS1.BasicAuthType,
      OPDS1.BasicTokenAuthType,
      OPDS1.SamlAuthType,
      OPDS1.OidcAuthType,
      OPDS1.CleverAuthType
    ];

    expectedTypes.forEach(type => {
      expect(authHandlers[type]).toBeDefined();
      expect(typeof authHandlers[type]).toBe("function");
    });
  });

  test("has correct number of handlers", () => {
    const handlerCount = Object.keys(authHandlers).length;
    expect(handlerCount).toBe(5);
  });
});

describe("isSupportedAuthType", () => {
  test("returns true for Basic auth type", () => {
    expect(isSupportedAuthType(OPDS1.BasicAuthType)).toBe(true);
  });

  test("returns true for BasicToken auth type", () => {
    expect(isSupportedAuthType(OPDS1.BasicTokenAuthType)).toBe(true);
  });

  test("returns true for SAML auth type", () => {
    expect(isSupportedAuthType(OPDS1.SamlAuthType)).toBe(true);
  });

  test("returns true for OIDC auth type", () => {
    expect(isSupportedAuthType(OPDS1.OidcAuthType)).toBe(true);
  });

  test("returns true for Clever auth type", () => {
    expect(isSupportedAuthType(OPDS1.CleverAuthType)).toBe(true);
  });

  test("returns false for unsupported auth type", () => {
    expect(
      isSupportedAuthType("http://opds-spec.org/auth/oauth/implicit")
    ).toBe(false);
  });

  test("returns false for random string", () => {
    expect(isSupportedAuthType("not-a-real-auth-type")).toBe(false);
  });
});
