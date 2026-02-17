/* eslint-disable camelcase */
import { beforeEach, expect, jest, test } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import * as React from "react";
import { OPDS1 } from "interfaces";
import { act, fixtures, setup } from "test-utils";
import Cookie from "js-cookie";
import * as router from "next/router";
import useUser, { UserProvider } from "components/context/UserContext";
import mockAuthenticatedOnce from "test-utils/mockAuthState";
import * as swr from "swr";
import { makeSwrResponse } from "test-utils/mockSwr";

const mockSWR = jest.spyOn(swr, "default");

const str = JSON.stringify;
const mockCookie = Cookie as any;
const useRouterSpy = jest.spyOn(router, "useRouter");

const mutateMock = jest.fn();
const defaultMock = makeSwrResponse<any>({
  data: fixtures.emptyCollection,
  mutate: mutateMock as any
});
mockSWR.mockReturnValue(defaultMock as any);

/**
 * This file tests both UserContext and useCredentials, as
 * the latter is only used within the former. It doesn't have
 * to pass the user provider in to the render function, because
 * render wraps everything with our ContextProvider already (see text-utils/index)
 */
function renderUserContext() {
  return setup(<UserProvider>child</UserProvider>);
}

beforeEach(() => {
  window.location.hash = "";
  useRouterSpy.mockReturnValue({
    query: {},
    replace: jest.fn()
  } as any);
});

test("fetches loans when credentials are present", async () => {
  mockAuthenticatedOnce();
  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "some-token", "http://opds-spec.org/auth/basic"],
    expect.anything(),
    expect.anything()
  );
});

test("does not fetch loans if no credentials are present", () => {
  mockAuthenticatedOnce(null);
  renderUserContext();
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

const mockReplace = jest.fn((..._args: unknown[]) => {
  window.location.hash = "";
});

test("extracts clever tokens from the url", () => {
  window.location.hash = "#access_token=fry6H3" as any;

  // Mock router with replace function
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: {},
    pathname: "/testlib/loans"
  } as any);

  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer fry6H3", methodType: OPDS1.CleverAuthType })
  );
  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer fry6H3",
      "http://librarysimplified.org/authtype/OAuth-with-intermediary"
    ],
    expect.anything(),
    expect.anything()
  );

  // Should have used router.replace to clear the Clever hash from the URL.
  expect(mockReplace).toHaveBeenCalledWith(
    { pathname: "/testlib/loans", query: {}, hash: "" },
    undefined,
    { shallow: true }
  );
});

test("extracts SAML tokens from the url", () => {
  // we have to mock the token in the router spy and also in
  // the url
  const url = new URL(window.location.href);
  url.searchParams.set("access_token", "saml-token");
  delete (window as any).location;
  window.location = url as any;
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "saml-token" },
    pathname: "/testlib/loans"
  } as any);
  renderUserContext();

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer saml-token", methodType: OPDS1.SamlAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer saml-token",
      "http://librarysimplified.org/authtype/SAML-2.0"
    ],
    expect.anything(),
    expect.anything()
  );

  // Should have used router.replace to clear the SAML token from the URL.
  expect(mockReplace).toHaveBeenCalledWith(
    { pathname: "/testlib/loans", query: {} },
    undefined,
    { shallow: true }
  );
});

test("extracts OIDC tokens when only OIDC is configured", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("access_token", "oidc-token");
  delete (window as any).location;
  window.location = url as any;
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "oidc-token" },
    pathname: "/testlib/loans"
  } as any);

  // Library with only OIDC auth configured
  setup(<UserProvider>child</UserProvider>, {
    library: {
      authMethods: [fixtures.clientOidcMethod]
    }
  });

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer oidc-token", methodType: OPDS1.OidcAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer oidc-token",
      "http://palaceproject.io/authtype/OpenIDConnect"
    ],
    expect.anything(),
    expect.anything()
  );

  // Should have used router.replace to clear the OIDC token from the URL.
  expect(mockReplace).toHaveBeenCalledWith(
    { pathname: "/testlib/loans", query: {} },
    undefined,
    { shallow: true }
  );
});

test("extracts SAML tokens when only SAML is configured", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("access_token", "saml-token");
  delete (window as any).location;
  window.location = url as any;
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "saml-token" },
    pathname: "/testlib/loans"
  } as any);

  // Library with only SAML auth configured
  setup(<UserProvider>child</UserProvider>, {
    library: {
      authMethods: [fixtures.clientSamlMethod]
    }
  });

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer saml-token", methodType: OPDS1.SamlAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer saml-token",
      "http://librarysimplified.org/authtype/SAML-2.0"
    ],
    expect.anything(),
    expect.anything()
  );
});

test("uses SAML when it comes first in auth methods (both OIDC and SAML configured)", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("access_token", "redirect-token");
  delete (window as any).location;
  window.location = url as any;
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "redirect-token" },
    pathname: "/testlib/loans"
  } as any);

  // Library with both SAML and OIDC configured - SAML comes first
  setup(<UserProvider>child</UserProvider>, {
    library: {
      authMethods: [fixtures.clientSamlMethod, fixtures.clientOidcMethod]
    }
  });

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  // Should use SAML because it's the first redirect-based auth method
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer redirect-token", methodType: OPDS1.SamlAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer redirect-token",
      "http://librarysimplified.org/authtype/SAML-2.0"
    ],
    expect.anything(),
    expect.anything()
  );
});

test("uses OIDC when it comes first in auth methods (both OIDC and SAML configured)", () => {
  const url = new URL(window.location.href);
  url.searchParams.set("access_token", "redirect-token");
  delete (window as any).location;
  window.location = url as any;
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "redirect-token" },
    pathname: "/testlib/loans"
  } as any);

  // Library with both OIDC and SAML configured - OIDC comes first
  setup(<UserProvider>child</UserProvider>, {
    library: {
      authMethods: [fixtures.clientOidcMethod, fixtures.clientSamlMethod]
    }
  });

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  // Should use OIDC because it's the first redirect-based auth method
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "Bearer redirect-token", methodType: OPDS1.OidcAuthType })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    [
      "/shelf-url",
      "Bearer redirect-token",
      "http://palaceproject.io/authtype/OpenIDConnect"
    ],
    expect.anything(),
    expect.anything()
  );
});

test("sign out clears cookies and data", async () => {
  mockAuthenticatedOnce();
  let extractedSignOut: any = null;
  function Extractor() {
    const { signOut } = useUser();
    extractedSignOut = signOut;
    return <div>hello</div>;
  }

  setup(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );

  // make sure fetch was called and you have the right data
  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "some-token", "http://opds-spec.org/auth/basic"],
    expect.anything(),
    expect.anything()
  );

  // now sign out
  act(() => extractedSignOut());

  // should have removed cookie
  expect(Cookie.remove).toHaveBeenCalledTimes(1);
  expect(Cookie.remove).toHaveBeenCalledWith("CPW_AUTH_COOKIE/testlib");

  // data should be revalidated
  expect(mutateMock).toHaveBeenCalledTimes(1);
});

test("sign in sets cookie", async () => {
  let extractedSignIn: any = null;
  function Extractor() {
    const { signIn, token } = useUser();
    extractedSignIn = signIn;
    return <div>{token}</div>;
  }
  setup(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );

  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  expect(Cookie.set).toHaveBeenCalledTimes(0);

  act(() => extractedSignIn("a-token", { type: "type" }));

  expect(mockCookie.set).toHaveBeenCalledTimes(1);
  expect(mockCookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/testlib",
    str({ token: "a-token", methodType: "type" })
  );

  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "a-token", "type"],
    expect.anything(),
    expect.anything()
  );
});

test("fetches patron profile when authenticated and userProfileUrl is available", () => {
  jest.useFakeTimers();
  mockAuthenticatedOnce();
  renderUserContext();

  // Should make SWR call for loans immediately
  expect(mockSWR).toHaveBeenCalledWith(
    ["/shelf-url", "some-token", "http://opds-spec.org/auth/basic"],
    expect.anything(),
    expect.anything()
  );

  // Initially, profile fetch should be called with null (delayed)
  expect(mockSWR).toHaveBeenCalledWith(
    null,
    expect.anything(),
    expect.anything()
  );

  // Fast-forward past the 300ms delay
  act(() => {
    jest.advanceTimersByTime(300);
  });

  // Now profile should be fetched
  expect(mockSWR).toHaveBeenCalledWith(
    ["/user-profile-url", "some-token"],
    expect.anything(),
    expect.anything()
  );

  jest.useRealTimers();
});

test("does not fetch patron profile when not authenticated", () => {
  mockAuthenticatedOnce(null);
  renderUserContext();

  // Should not make any SWR calls for patron profile
  const profileCalls = (mockSWR as jest.Mock).mock.calls.filter(
    call => call[0] && call[0][0] === "/user-profile-url"
  );
  expect(profileCalls.length).toBe(0);
});

test("exposes patronId from profile data", () => {
  jest.useFakeTimers();
  mockAuthenticatedOnce();

  // Mock the patron profile SWR call to return profile data
  mockSWR.mockImplementation((key: any) => {
    if (key && Array.isArray(key) && key[0] === "/user-profile-url") {
      return makeSwrResponse({
        data: {
          "simplified:authorization_identifier": "patron-123"
        }
      }) as any;
    }
    return defaultMock as any;
  });

  let extractedPatronId: string | undefined = undefined;
  function Extractor() {
    const { patronId } = useUser();
    extractedPatronId = patronId;
    return <div>hello</div>;
  }

  setup(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );

  // Fast-forward past the delay to trigger profile fetch
  act(() => {
    jest.advanceTimersByTime(300);
  });

  expect(extractedPatronId).toBe("patron-123");
  jest.useRealTimers();
});

test("patronId is undefined when profile fetch fails", () => {
  jest.useFakeTimers();
  mockAuthenticatedOnce();

  // Mock the patron profile SWR call to return no data
  mockSWR.mockImplementation((key: any) => {
    if (key && Array.isArray(key) && key[0] === "/user-profile-url") {
      return makeSwrResponse({ data: undefined }) as any;
    }
    return defaultMock as any;
  });

  let extractedPatronId: string | undefined = "should-be-undefined";
  function Extractor() {
    const { patronId } = useUser();
    extractedPatronId = patronId;
    return <div>hello</div>;
  }

  setup(
    <UserProvider>
      <Extractor />
    </UserProvider>
  );

  // Fast-forward past the delay to trigger profile fetch
  act(() => {
    jest.advanceTimersByTime(300);
  });

  expect(extractedPatronId).toBeUndefined();
  jest.useRealTimers();
});
