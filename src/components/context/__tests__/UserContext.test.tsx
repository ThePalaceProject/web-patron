/* eslint-disable camelcase */
import * as React from "react";
import { AuthCredentials, BookData, OPDS1 } from "interfaces";
import { act, fixtures, render, waitFor } from "test-utils";
import Cookie from "js-cookie";
import * as router from "next/router";
import useUser from "components/context/UserContext";
import * as fetch from "dataflow/opds1/fetch";
/**
 * This file tests both UserContext and useCredentials, as
 * the latter is only used within the former. It doesn't have
 * to pass the user provider in to the render function, because
 * render wraps everything with our ContextProvider already (see text-utils/index)
 */

(fetch as any).fetchCollection = jest.fn();
const mockedFetchCollection = fetch.fetchCollection as jest.MockedFunction<
  typeof fetch.fetchCollection
>;
const mockCookie = Cookie as any;

const credentials: AuthCredentials = {
  token: "some-token",
  methodType: OPDS1.BasicAuthType
};

const str = JSON.stringify;

function expectFetchWithToken(token: string, type: string) {
  expect(fetch.fetchCollection).toHaveBeenCalledWith("/shelf-url", token, type);
}

const useRouterSpy = jest.spyOn(router, "useRouter");

/**
 * Our custom `render` already wraps passing in components
 * with a UserProvider automatically, so we don't need to
 * pass the component in manually here.
 */
function renderUserContext() {
  return render(<div>child</div>);
}

beforeEach(() => {
  window.location.hash = "";
  useRouterSpy.mockReturnValue({
    query: {},
    replace: jest.fn()
  } as any);
});

test("fetches loans when credentials are present", () => {
  mockCookie.get.mockReturnValueOnce(str(credentials));
  renderUserContext();

  expect(fetch.fetchCollection).toHaveBeenCalledTimes(1);
  expectFetchWithToken(credentials.token, OPDS1.BasicAuthType);
});

test("does not fetch loans if no credentials are present", () => {
  mockCookie.get.mockReturnValueOnce(str(null));
  renderUserContext();
  expect(fetchMock).toHaveBeenCalledTimes(0);
});

const mockReplace = jest.fn(() => {
  window.location.hash = "";
});

test("extracts clever tokens from the url", () => {
  window.location.hash = "#access_token=fry6H3" as any;

  useRouterSpy.mockReturnValue({ replace: mockReplace, query: {} } as any);
  renderUserContext();

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/null",
    str({ token: "Bearer fry6H3", methodType: OPDS1.CleverAuthType })
  );
  expect(fetch.fetchCollection).toHaveBeenCalledTimes(1);
  expectFetchWithToken("Bearer fry6H3", OPDS1.CleverAuthType);

  // mock the router
  expect(mockReplace).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("extracts SAML tokens from the url", () => {
  useRouterSpy.mockReturnValue({
    replace: mockReplace,
    query: { access_token: "saml-token" }
  } as any);
  renderUserContext();

  expect(Cookie.set).toHaveBeenCalledTimes(1);
  expect(Cookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/null",
    str({ token: "Bearer saml-token", methodType: OPDS1.SamlAuthType })
  );

  expect(fetch.fetchCollection).toHaveBeenCalledTimes(1);
  expectFetchWithToken("Bearer saml-token", OPDS1.SamlAuthType);

  expect(mockReplace).toHaveBeenCalledWith(
    "http://test-domain.com/",
    undefined,
    { shallow: true }
  );
});

test("sign out clears cookies and data", async () => {
  mockCookie.get.mockReturnValueOnce(str(credentials));
  mockedFetchCollection.mockResolvedValue(fixtures.loans);
  let extractedSignOut: any = null;
  let extractedLoans: BookData[] | undefined = undefined;
  function Extractor() {
    const { signOut, loans } = useUser();
    extractedSignOut = signOut;
    extractedLoans = loans;
    return <div>hello</div>;
  }
  render(<Extractor />);

  // make sure fetch was called and you have the right data
  expect(fetch.fetchCollection).toHaveBeenCalledTimes(1);
  expectFetchWithToken(credentials.token, OPDS1.BasicAuthType);
  await waitFor(() => expect(extractedLoans).toHaveLength(1));

  // now sign out
  act(() => {
    extractedSignOut();
  });

  // should have removed cookie
  expect(Cookie.remove).toHaveBeenCalledTimes(1);
  expect(Cookie.remove).toHaveBeenCalledWith("CPW_AUTH_COOKIE/null");

  // data should be removed
  expect(extractedLoans).toBeUndefined();
});

test("sign in sets cookie", () => {
  mockCookie.get.mockReturnValueOnce(str(credentials));
  let extractedSignIn: any = null;
  function Extractor() {
    const { signIn } = useUser();
    extractedSignIn = signIn;
    return <div>hello</div>;
  }
  render(<Extractor />);

  expect(Cookie.set).toHaveBeenCalledTimes(0);

  extractedSignIn("token", { type: "type" });

  expect(mockCookie.set).toHaveBeenCalledTimes(1);
  expect(mockCookie.set).toHaveBeenCalledWith(
    "CPW_AUTH_COOKIE/null",
    str({ token: "token", methodType: "type" })
  );
});
