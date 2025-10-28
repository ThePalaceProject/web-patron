import BasicTokenAuthHandler from "auth/BasicTokenAuthHandler";
import { UserProvider } from "components/context/UserContext";
import { OPDS1 } from "interfaces";
import Cookie from "js-cookie";
import * as React from "react";
import { fixtures, screen, setup, waitFor } from "test-utils";
import {
  basicTokenAuthenticationUrl,
  basicTokenAuthMethod
} from "test-utils/fixtures";
import mockAuthenticatedOnce, {
  expirationDate,
  firstToken,
  tokenCreds1
} from "test-utils/mockAuthState";
import { generateCredentials } from "utils/auth";

beforeEach(() => {
  jest.useFakeTimers();
  const mockedDate = expirationDate;
  jest.spyOn(Date, "now").mockImplementation(() => mockedDate.getTime());
  fetchMock.resetMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

test("displays form", async () => {
  const { user } = setup(
    <BasicTokenAuthHandler method={basicTokenAuthMethod} />
  );

  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  expect(barcode).toBeInTheDocument();
  expect(pin).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();

  await user.type(barcode, "1234");
  await user.type(pin, "pinpin");

  expect(barcode).toHaveValue("1234");
  expect(pin).toHaveValue("pinpin");
});

test("toggle password visibility", async () => {
  const { user } = setup(
    <BasicTokenAuthHandler method={basicTokenAuthMethod} />
  );

  // Input initially renders as password input
  const input = await screen.findByLabelText("Pin input");
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute("type", "password");

  const showPasswordIconButton = await screen.findByLabelText("show password");
  expect(showPasswordIconButton).toHaveAttribute("type", "button");
  await user.click(showPasswordIconButton);

  // After toggle, input becomes text so password is visible
  const hidePasswordIconButton = await screen.findByLabelText("hide password");
  expect(input).toBeInTheDocument();
  expect(input).toHaveAttribute("type", "text");
  expect(hidePasswordIconButton).toBeInTheDocument();
});

test("submit by clicking login button", async () => {
  // give the mock a delay to allow loading state to appear

  fetchMock
    // Receive token from auth
    .once(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve(
                JSON.stringify({
                  accessToken: firstToken,
                  expiresIn: 3600,
                  tokenType: "Bearer"
                })
              ),
            1
          )
        )
    )
    .once(
      // Get loans using token
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve(JSON.stringify(fixtures.loans)), 1)
        )
    );

  const { user } = setup(
    <UserProvider>
      <BasicTokenAuthHandler method={basicTokenAuthMethod} />
    </UserProvider>
  );

  // act
  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  await user.type(barcode, "1234");
  await user.type(pin, "pinpin");
  const loginButton = screen.getByRole("button", { name: "Login" });
  await user.click(loginButton);

  const basicToken = generateCredentials("1234", "pinpin");

  // shows a loading state
  const loadingButton = await screen.findByLabelText("Signing in...");
  expect(loadingButton).toBeInTheDocument();
  expect(loadingButton).toBeDisabled();

  // assert
  // we wrap this in waitFor because the handleSubmit from react-hook-form has
  // async code in it
  await waitFor(() => {
    // we set the cookie
    expect(Cookie.set).toHaveBeenCalledTimes(1);
    const [credentialsKey, credentialsValue] = (Cookie.set as jest.Mock).mock
      .calls[0];

    expect(credentialsKey).toEqual("CPW_AUTH_COOKIE/testlib");
    const parsed = JSON.parse(credentialsValue);
    expect(parsed).toMatchObject({
      token: {
        basicToken: basicToken,
        bearerToken: `Bearer ${firstToken}`
      },
      authenticationUrl: basicTokenAuthenticationUrl,
      methodType: OPDS1.BasicTokenAuthType
    });

    // separately check that expirationDate was set
    expect(typeof parsed.token.expirationDate).toBe("string");
    expect(() =>
      new Date(parsed.token.expirationDate).toISOString()
    ).not.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call grabs token from /patrons/me/token using username and password
    expect(fetchMock).toHaveBeenNthCalledWith(1, basicTokenAuthenticationUrl, {
      headers: {
        Authorization: basicToken,
        "X-Requested-With": "XMLHttpRequest"
      },
      method: "POST"
    });

    // Second call to get loans with Bearer Token
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/shelf-url", {
      headers: {
        Authorization: `Bearer ${firstToken}`,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });
  });
});

test("fetch new token if token has expired", async () => {
  // set credentials to trigger fetch in <UserProvider />
  // expired token returns 401
  mockAuthenticatedOnce(tokenCreds1);

  const problemdoc: OPDS1.ProblemDocument = {
    type: "http://librarysimplified.org/terms/problem/patron-auth-access-token-expired",
    detail: "The patron authentication access token has expired.",
    title: "Access token expired",
    status: 401
  };

  fetchMock.mockResponseOnce(JSON.stringify(problemdoc), {
    status: 401
  });

  setup(
    <UserProvider>
      <BasicTokenAuthHandler method={basicTokenAuthMethod} />
    </UserProvider>
  );

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // attempt fetch with old token
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/shelf-url", {
      headers: {
        Authorization: firstToken,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });

    // get new token with username and password saved in credentials
    expect(fetchMock).toHaveBeenNthCalledWith(2, basicTokenAuthenticationUrl, {
      headers: {
        Authorization: generateCredentials("1234", "pinpin"),
        "X-Requested-With": "XMLHttpRequest"
      },
      method: "POST"
    });
  });
});
