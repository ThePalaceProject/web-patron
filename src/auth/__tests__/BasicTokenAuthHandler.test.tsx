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
    )
    .once(
      // Get patron profile using token
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve(
                JSON.stringify({
                  "simplified:authorization_identifier": "test-patron-123"
                })
              ),
            1
          )
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

  // Advance timers to trigger the delayed profile fetch (300ms delay)
  await waitFor(() => {
    jest.advanceTimersByTime(300);
  });

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

    expect(fetchMock).toHaveBeenCalledTimes(3);

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

    // Third call to get patron profile with Bearer Token
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/user-profile-url", {
      headers: {
        Authorization: `Bearer ${firstToken}`
      }
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

  fetchMock
    // Mock 1: First loans fetch with expired token → 401
    .mockResponseOnce(JSON.stringify(problemdoc), {
      status: 401
    })
    // Mock 2: First profile fetch with expired token → 401
    .mockResponseOnce(JSON.stringify(problemdoc), {
      status: 401
    })
    // Mock 3: Token refresh endpoint returns new access token
    .mockResponseOnce(
      JSON.stringify({
        accessToken: "newAccessToken123",
        expiresIn: 3600,
        tokenType: "Bearer"
      })
    )
    // Mock 4: Loans retry (happens during token update) → succeeds
    .mockResponseOnce(JSON.stringify(fixtures.loans))
    // Mock 5: Loans revalidation with new token → succeeds
    .mockResponseOnce(JSON.stringify(fixtures.loans))
    // Mock 6: Profile fetch with new token → succeeds
    .mockResponseOnce(
      JSON.stringify({
        "simplified:authorization_identifier": "test-patron-123"
      })
    );

  setup(
    <UserProvider>
      <BasicTokenAuthHandler method={basicTokenAuthMethod} />
    </UserProvider>
  );

  // Advance timers to trigger the first delayed profile fetch (300ms delay)
  await waitFor(() => {
    jest.advanceTimersByTime(300);
  });

  // Advance timers again to trigger the profile fetch with new token (another 300ms delay)
  await waitFor(() => {
    jest.advanceTimersByTime(300);
  });

  await waitFor(() => {
    // Expected fetch sequence (at least 6 calls):
    // 1. GET /shelf-url with expired token → 401 (mock 1)
    // 2. GET /user-profile-url with expired token → 401 (mock 2)
    // 3. POST /patrons/me/token/ → new access token (mock 3)
    // 4. GET /shelf-url retry during token update → loans data (mock 4)
    // 5. GET /shelf-url with new token → loans data (mock 5)
    // 6. GET /user-profile-url with new token → profile data (mock 6)
    expect(fetchMock).toHaveBeenCalledWith(
      basicTokenAuthenticationUrl,
      expect.anything()
    );

    // Verify loans fetch happened with old token
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/shelf-url", {
      headers: {
        Authorization: firstToken,
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "*"
      },
      method: "GET"
    });

    // Verify profile fetch with old token
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/user-profile-url", {
      headers: {
        Authorization: firstToken
      }
    });

    // Verify new token was fetched
    expect(fetchMock).toHaveBeenNthCalledWith(3, basicTokenAuthenticationUrl, {
      headers: {
        Authorization: generateCredentials("1234", "pinpin"),
        "X-Requested-With": "XMLHttpRequest"
      },
      method: "POST"
    });

    // Verify loans eventually got fetched with new token (call 5 or later)
    const loansCallsWithNewToken = fetchMock.mock.calls.filter(
      (call: any, index: number) =>
        index >= 4 && // After token refresh
        call[0] === "/shelf-url" &&
        call[1]?.headers?.Authorization === "Bearer newAccessToken123"
    );
    expect(loansCallsWithNewToken.length).toBeGreaterThanOrEqual(1);
  });
});

test("displays error when credentials are invalid", async () => {
  const problemDoc: OPDS1.ProblemDocument = {
    type: "http://librarysimplified.org/terms/problem/credentials-invalid",
    title: "Invalid credentials",
    detail: "A valid library card barcode number and PIN are required.",
    status: 401
  };

  fetchMock.mockResponseOnce(JSON.stringify(problemDoc), {
    status: 401
  });

  const { user } = setup(
    <UserProvider>
      <BasicTokenAuthHandler method={basicTokenAuthMethod} />
    </UserProvider>
  );

  const barcode = await screen.findByLabelText("Barcode input");
  const pin = await screen.findByLabelText("Pin input");
  await user.type(barcode, "wrong");
  await user.type(pin, "credentials");

  const loginButton = screen.getByRole("button", { name: "Login" });
  await user.click(loginButton);

  // Error should be displayed
  await waitFor(() => {
    expect(
      screen.getByText(
        /Invalid credentials: A valid library card barcode number and PIN are required/i
      )
    ).toBeInTheDocument();
  });

  // Credentials should not be set
  expect(Cookie.set).not.toHaveBeenCalled();
});
